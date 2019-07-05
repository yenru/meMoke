document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {	//頁面載入完成
	// appMethod.showLoading(config.message.loadingMemo.title, config.message.loadingMemo.content);
	if(!config.onDebugMode) GoogleAnalytics.setUser(device.uuid);

	if(!localStorage.userConfig) appMethod.introduction();

	if(!sessionStorage.adShowTime) {	//近期未登入app
		sessionStorage.adShowTime = 1;
		if(appMethod.showAD()) adMobFun.showInterstitial(true);
		appPush.register();			//註冊推播
		appPush.notification();		//推播通知

		appMethod.initDBtable(function() {	//建立資料庫
			RemoteConfig.init(function() {	//取得系統參數
				appMethod.checkVersion();	//檢查版本
			});
		}, function() {
			// appMethod.showLoading(config.message.initDBfailed.title, config.message.initDBfailed.content);
		});
	}
	else {	//重覆刷新頁面，忽略版本檢查等動作
		appMethod.openDatabase();
		if(appMethod.showAD()) adMobFun.showInterstitial(true);
		initData();
	}
	adMobFun.showBanner();
}
function appCheckFinish() {		//版本檢查結束
	// RemoteConfig.getValue("bulletin", function(url) {	//取得公告
	// 	if(url) {
	// 		$.get(url, function (bulletinTheme) {	//取得banner資訊
	// 			if(bulletinTheme) {		//顯示公告資訊
	// 				bulletinTheme = replaceAll(bulletinTheme, "script", "js");	//避免執行腳本語言
	// 				$("body").append("<div id=\"bulletin\">"+bulletinTheme+"</div>");
					initData();
	// 			}
	// 		});
	// 	}
	// 	else initData();
	// });
}

var onEdit = false;			//鎖定編輯狀態
var onScrolling = false;	//正在滾動
var lastMemoID = 0;			//最後一筆memo_id
var memoSelectID = -1;		//目前選擇的記事
function initData() {
	getMemoList(false);
	appMethod.db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM `memo` ORDER BY `memo_id` DESC', [], function(tx, rs) {
			if (rs.rows.length != 0) lastMemoID = rs.rows.item(0).memo_id;	//取得最後一筆memo_id
		}, function(tx, error) {});
		tx.executeSql('SELECT * FROM `memo` WHERE `color` != "" GROUP BY `color`', [], function(tx, rs) {
			if (rs.rows.length == 0) $("li[viewClass='color']").attr("empty", "true").hide();
			else {
				var len = rs.rows.length;
				for(var i=0; i<len; i++) {
					var row = rs.rows.item(i);
					if(row.color != "") $("#mFunc_viewFilter li[viewClass='color']").append("<span fontColor=\""+row.color+"\" style=\"background-color:"+row.color+"\"></span>");
				}
				$("#mFunc_viewFilter li[viewClass='color'] span").click(function(){
					appMethod.setUserConfig("lastViewClass", "color");
					appMethod.setUserConfig("lastViewFilter", $(this).css("background-color"));
					getMemoList(true);
					$(".menuList").hide();
					GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"selectViewFilter"});
				});
			}
		}, function(tx, error) {
			$("li[viewClass='color']").attr("empty", "true").hide();
		});
		tx.executeSql('SELECT * FROM `memo` GROUP BY `bold`', [], function(tx, rs) {
			if (rs.rows.length == 1) $("li[viewClass='bold']").attr("empty", "true").hide();
			else {
				$("#mFunc_viewFilter li[viewClass='bold'] button").click(function(){
					appMethod.setUserConfig("lastViewClass", "bold");
					appMethod.setUserConfig("lastViewFilter", $(this).text());
					getMemoList(true);
					$(".menuList").hide();
					GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"selectViewFilter"});
				});
			}
		}, function(tx, error) {
			$("li[viewClass='bold']").attr("empty", "true").hide();
		});
		tx.executeSql('SELECT * FROM `memo` WHERE `background` != "" GROUP BY `background`', [], function(tx, rs) {
			var len = rs.rows.length;
			if (len == 0) $("li[viewClass='background']").attr("empty", "true").hide();
			else {
				for(var i=0; i<len; i++) {
					var row = rs.rows.item(i);
					if(row.background != "") $("#mFunc_viewFilter li[viewClass='background']").append("<span bgColor=\""+row.background+"\" style=\"background-color:"+row.background+"\"></span>");
				}
				$("#mFunc_viewFilter li[viewClass='background'] span").click(function(){
					appMethod.setUserConfig("lastViewClass", "background");
					appMethod.setUserConfig("lastViewFilter", $(this).css("background-color"));
					getMemoList(true);
					$(".menuList").hide();
					GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"selectViewFilter"});
				});
			}
		}, function(tx, error) {
			$("li[viewClass='background']").attr("empty", "true").hide();
		});
		tx.executeSql('SELECT * FROM `memo` WHERE `label` != "" GROUP BY `label`', [], function(tx, rs) {
			var len = rs.rows.length;
			if (len == 0) $("li[viewClass='label']").attr("empty", "true").hide();
			else {
				for(var i=0; i<len; i++) {
					var row = rs.rows.item(i);
					var semicolon = row.label.indexOf(";");
					var iconName = row.label.substring(0, semicolon);
					var iconColor = row.label.substring(semicolon + 1, row.label.length);
					$("#mFunc_viewFilter li[viewClass='label']").append("<i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/"+appMethod.getColorDir(iconColor)+"/"+iconName+".svg);\" labelKey=\""+row.label+"\"></i>");
				}
				$("#mFunc_viewFilter li[viewClass='label'] i").click(function(){
					appMethod.setUserConfig("lastViewClass", "label");
					appMethod.setUserConfig("lastViewFilter", $(this).attr("labelKey"));
					getMemoList(true);
					$(".menuList").hide();
					GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"selectViewFilter"});
				});
			}
		}, function(tx, error) {
			$("li[viewClass='label']").attr("empty", "true").hide();
		});
		tx.executeSql('SELECT * FROM `memo` WHERE `tag` != "" GROUP BY `tag`', [], function(tx, rs) {
			var len = rs.rows.length;
			if (len == 0) $("li[viewClass='tag']").attr("empty", "true").hide();
			else {
				for(var i=0; i<len; i++) {
					var row = rs.rows.item(i);
					if(row.tag != "") {
						var tags = row.tag.split(";");
						var tags_len = tags.length;
						for(var j=0; j<tags_len; j++) {
							if($("#mFunc_viewFilter span[tagColor='"+tags[j]+"']").length == 0)
								$("#mFunc_viewFilter li[viewClass='tag']").append("<span tagColor=\""+tags[j]+"\" style=\"background-color:"+tags[j]+"\"></span>");
						}
					}
				}
				$("#mFunc_viewFilter li[viewClass='tag'] span").click(function(){
					appMethod.setUserConfig("lastViewClass", "tag");
					appMethod.setUserConfig("lastViewFilter", $(this).attr("tagColor"));
					getMemoList(true);
					$(".menuList").hide();
					GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"selectViewFilter"});
				});
			}
		}, function(tx, error) {
			$("li[viewClass='tag']").attr("empty", "true").hide();
		});
		// tx.executeSql('SELECT * FROM `groups` ORDER BY `group_id`', [], function(tx, rs) {
		// 	if (rs.rows.length == 0) {	//找不到群組資料
				$("li[viewClass='group']").attr("empty", "true").hide();	//隱藏所有群組選項
		// 	}
		// 	else {
		// 		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"selectViewFilter"});
		// 	}
		// }, function(tx, error) {
		// 	$("li[viewClass='group']").attr("empty", "true").hide();
		// });
	});
    bindEvent();
}
function getMemoList(animate) {
	appMethod.logMenuClear();
	var userConfig = appMethod.getUserConfig();
	var sqlWhereStr = " WHERE ";
	var sqlValue = [];

	showFilterTitle();
	if(userConfig.lastViewClass == "date") {	//顯示模式為日期
		$("#menu_function li[viewClass=date]").show();
		sqlWhereStr += "`date` = ?";
		sqlValue.push( appMethod.getShowDate() );
	}
	else {
		$("#menu_function li[viewClass=date]").hide();
		switch(userConfig.lastViewClass) {
			case 'bold':
				sqlWhereStr += "`bold` = ?";
				if (userConfig.lastViewFilter == "粗字體") sqlValue.push(1);
				else sqlValue.push(0);
				break;
			case 'color':
			case 'background':
			case 'label':
				sqlWhereStr += "`"+userConfig.lastViewClass+"` = ?";
				sqlValue.push(userConfig.lastViewFilter);
				break;
			case 'tag':
				sqlWhereStr += "`tag` LIKE ?";
				sqlValue.push("%"+userConfig.lastViewFilter+"%");
				break;
			default:
				break;
		}
	}

	appMethod.db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM `memo`'+sqlWhereStr+' ORDER BY `order`', sqlValue, function(tx, rs) {
			memoClear(animate);
			var len = rs.rows.length;
			if (len == 0) checkEmpty();		//目前沒有記事
			else {
				for(var i=0; i<len; i++) {
					var row = rs.rows.item(i);
					var $memoRecord = $("<li memoID=\""+row.memo_id+"\" date=\""+row.date+"\"></li>");	//建立單筆記事物件
					if(row.group_id != -1) $memoRecord.attr("groupID", row.group_id);
					if(row.background) $memoRecord.css("background-color", row.background);		//有背景色
					if(row.color) $memoRecord.css("color", row.color);

					if(row.finished) {	//已完成
						$memoRecord.addClass("done");
						$memoRecord.append("<input type=\"checkbox\" checked />");
					}
					else $memoRecord.append("<input type=\"checkbox\" />");

					if(row.label) {	//有label
						var semicolon = row.label.indexOf(";");
						var iconName = row.label.substring(0, semicolon);
						var iconColor = appMethod.getColorDir( row.label.substring(semicolon + 1, row.label.length) );
						$memoRecord.append("<span class=\"label\"><i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/"+iconColor+"/"+iconName+".svg);\" name=\""+iconName+"\" color=\""+iconColor+"\"></i></span>");
					}

					var $memoText = $("<p>"+row.title+"</p>");		//記事內容
					if(row.bold) $memoText.css("font-weight", "bold");
					$memoText.appendTo($memoRecord);

					if(row.tag) {	//有tag
						var tags = row.tag.split(';');
						var tags_len = tags.length;
						var $tagsObj = $("<div class=\"tags\"></div>");
						for(var j=0; j<tags_len; j++) {
							$tagsObj.append("<span class=\"tag\" style=\"background-color:"+tags[j]+"\"></span>");
						}
						$tagsObj.appendTo($memoRecord);
					}

					$memoRecord.append("<div class=\"editbox\"><p class=\"memoRemark\">"+row.remarks+"</p></div>");	//記事備註
					$memoRecord.appendTo("#memoList ul");
				}

				if(userConfig.showOrHide == "show") {
					$("#menu_function .viewHide").html("<i class=\"material-icons hideFinish\" style=\"background-image: url(library/GoogleMaterialIcons/000000/indeterminate_check_box.svg);\"></i>隱藏已完成事項");
					$("#memoList li[class='done']").show();
				}
				else {
					$("#menu_function .viewHide").html("<i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/000000/check_box.svg);\"></i>顯示已完成事項");
					$("#memoList li[class='done']").hide();
					checkEmpty();
				}
			}
		}, function(tx, error) {});
	});
}
function bindEvent() {      //事件系結
    $("#addMemo").click(function(){		//新增記事按鈕
		$("#memoEdit .tip").text("新增記事");
		$("#memoEdit li[type=date]").attr("onclick", "appMethod.openDatePicker('#memoEdit li[type=date] p', true);");
		if($("#memoEdit .menu_bottom .menu_right").length == 0)
			$("#memoEdit .menu_bottom").append("<button class=\"menu_right\" onclick=\"memoAdd()\"><i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/000000/add.svg);\"></i>新增</button>");

		appMethod.resetEditor();
		$("#memoEdit li[type=date] p").text( appMethod.formateDate(new Date(appMethod.editor.startDate)) );
		
		//將目前頁面的篩選條件設為預設值
		var userConfig = appMethod.getUserConfig();
		switch(userConfig.lastViewClass) {
			case 'date':
				if(userConfig.lastViewFilter == "Yesterday") {
					var yesterday = new Date();
					yesterday.setDate( yesterday.getDate() - 1 );
					appMethod.editor.startDate = yesterday.getTime();
					$("#memoEdit li[type=date] p").text( appMethod.formateDate(yesterday) );
				}
				else if(userConfig.lastViewFilter == "Tomorrow") {
					var tomorrow = new Date();
					tomorrow.setDate( tomorrow.getDate() + 1 );
					appMethod.editor.startDate = tomorrow.getTime();
					$("#memoEdit li[type=date] p").text( appMethod.formateDate(tomorrow) );
				}
				else if(userConfig.lastViewFilter != "Today") {
					appMethod.editor.startDate = new Date(userConfig.lastViewFilter).getTime();
					$("#memoEdit li[type=date] p").text( userConfig.lastViewFilter );
				}
				break;
			case 'bold':
				if (userConfig.lastViewFilter == "粗字體") {
					$("#memoEdit li[type=bold] p").css("font-weight", "bold");
					$("#memoEdit li[type=bold] p").text("粗");
					appMethod.editor.bold = 1;
				}
				break;
			case 'color':
			case 'background':
			case 'tag':
				appMethod.editor[userConfig.lastViewClass] = userConfig.lastViewFilter;
				$("#memoEdit li[type="+userConfig.lastViewClass+"] p").append("<span style=\"background-color:"+userConfig.lastViewFilter+"\"></span>");
				break;
			case 'label':
				appMethod.editor.label = userConfig.lastViewFilter;
				var semicolon = userConfig.lastViewFilter.indexOf(";");
				var iconName = userConfig.lastViewFilter.substring(0, semicolon);
				var iconColor = appMethod.getColorDir( userConfig.lastViewFilter.substring(semicolon + 1, userConfig.lastViewFilter.length) );
				$("#memoEdit li[type=label] p").append("<i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/"+iconColor+"/"+iconName+".svg);\" name=\""+iconName+" color=\""+iconColor+"\"></i>");
				break;
			default:
				break;
		}
		appMethod.editor.endDate = appMethod.editor.startDate;
		$("#memoEdit").show();
		appMethod.logOpenMenu("#memoEdit", "memoEditCancel()");
		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"addMemo"});
    });
	$("#viewType p").click(function(){	//選擇記事種類類型
		var userConfig = appMethod.getUserConfig();
		openViewFilter(userConfig.lastViewClass);
		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"tapTitle"});
	});
    $("#openMenu").click(function(){	//開啟菜單
		if( $("#mFunc_viewClass li[empty != true]").length == 3 ) $("#menu_function li:first-child").hide();
		$("#menu_function").show();
		appMethod.logOpenMenu("#menu_function", "menuFuncitonClose()");
		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"openMenu"});
    });
	$("#memoList").on("change", "input[type=checkbox]", function(e) {
		var $parent = $(this).parent();
		var finished = $(this).prop("checked");
		memoSelectID = parseInt($parent.attr("memoID"));
		if(finished) $parent.addClass("done");
		else $parent.removeClass("done");
		
		appMethod.updateData("memo", {memo_id: memoSelectID}, {
			finished: (finished?1:0),
			timestamp: Date.now()
		});
		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"changeFinished"});
	});
	$("#memoList").on("tap", "li", function(e, touch) {			//點擊記事
		// $(touch[0].target).find("input").trigger("click");
		var $target = $(touch[0].target);
		memoSelectID = parseInt($(this).attr("memoID"));
		if($target.prop("outerHTML").indexOf("input") == 1) {	//點擊在checkbox上
			// var finished = $target.prop("checked");
			// if(!finished) $(this).addClass("done");
			// else $(this).removeClass("done");

			// appMethod.db.transaction(function(tx) {
			// 	tx.executeSql('UPDATE `memo` SET `finished` = ? WHERE `memo_id` = ?', [finished, memoSelectID], function(tx, rs) {
			// 	}, function(tx, error) {});
			// });
		}
		else if(!onEdit && !$target.hasClass("memoRemark")) {		//目前沒有記事佔用編輯&點擊在條目上
			var $editbox = $(this).find(".editbox");

			if($editbox.find(".memoRemark").text() == "") {		//沒有備註，直接開啟編輯
				openRemarkEdit($editbox.find(".memoRemark"), $(this).css("color"));
				$(this).find("p").addClass("fullMemo");
				$editbox.show();
			}
			else if($editbox.is(':hidden')) {
				$(".editbox").hide();	//隱藏所有備註
				$(this).find("p").addClass("fullMemo");
				$editbox.show();	//切換顯示或隱藏
			}
			else {
				$(this).find("p.fullMemo").removeClass("fullMemo");
				$(".editbox").hide();	//隱藏所有備註
			}
			GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"switchRemark"});
		}
	});
	$("#memoList").on("taphold", "li", function(e, touch) {		//長按記事
		if(!onEdit) {	//編輯中不彈出選單
			// var $target = $(touch[0].target);
			// if(!$target.hasClass("memoRemark")) $("#menu_record").show();
			memoSelectID = parseInt($(this).attr("memoID"));
			$("#menu_record").show();
			appMethod.logOpenMenu("#menu_record");
			GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"openMemoFunc"});
		}
	});
	$("#memoList").on("doubletap", "p.memoRemark", function(e, touch) {		//雙擊備註
		var $target = $(touch.secondTap.target);	//.editbox
		openRemarkEdit($target, $target.parent().css("color"));
	});
	$("#memoList").on("scroll", function(e) {
		onScrolling = true;
	});
	$("#memoList").on("scrollend", function(e, touch) {
		onScrolling = false;
	});
	$("#memoList").on("swipeleft", function(e, touch) {
		if(!onScrolling) page_swipeleft();
	});
	$("#memoList").on("swiperight", function(e, touch) {
		if(!onScrolling) page_swiperight();
	});
	$("#touchArea").on("swipeleft", function(e, touch) {
		page_swipeleft();
	});
	$("#touchArea").on("swiperight", function(e, touch) {
		page_swiperight();
	});
	cloneFormInit();
	
	$("#mFunc_viewFilter #calendar").kendoCalendar({	//顯示清單內容的日期選擇器
		change: function() {
			var today = new Date();
			var yesterday = new Date();
			var tomorrow = new Date();
			yesterday.setDate( today.getDate() - 1 );
			tomorrow.setDate( today.getDate() + 1 );
			var selectDate = appMethod.formateDate(this.value());
			var viewFilter = selectDate;
			if(selectDate == appMethod.formateDate(today)) viewFilter = "Today";
			else if(selectDate == appMethod.formateDate(yesterday)) viewFilter = "Yesterday";
			else if(selectDate == appMethod.formateDate(tomorrow)) viewFilter = "Tomorrow";

			appMethod.setUserConfig("lastViewClass", "date");
			appMethod.setUserConfig("lastViewFilter", viewFilter);
			getMemoList(true);
			$(".menuList").hide();
			GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"selectViewFilter"});
		},
		format: "yyyy.MM.dd",
		footer: false
	});
}
function page_swipeleft() {
	if(!onEdit) {
		var userConfig = appMethod.getUserConfig();
		switch(userConfig.lastViewClass) {
			case 'date':
				var showDate = new Date(appMethod.getShowDate());
				showDate.setDate( showDate.getDate() + 1 );
				var yesterday = new Date();
				yesterday.setDate( yesterday.getDate() - 1 );
				
				if(userConfig.lastViewFilter == "Today") appMethod.setUserConfig("lastViewFilter", "Tomorrow");
				else if(userConfig.lastViewFilter == "Yesterday") appMethod.setUserConfig("lastViewFilter", "Today");
				else if(appMethod.formateDate(showDate) == appMethod.formateDate(yesterday)) appMethod.setUserConfig("lastViewFilter", "Yesterday");
				else appMethod.setUserConfig("lastViewFilter", appMethod.formateDate(showDate));

				break;
			case 'bold':
				if(userConfig.lastViewFilter == "粗字體") appMethod.setUserConfig("lastViewFilter", "細字體");
				else appMethod.setUserConfig("lastViewFilter", "粗字體");
				break;
			case 'color':
				let $viewFilterObj = $("#mFunc_viewFilter li[viewClass='color']").find("span");
				let forwardIndex = $("#mFunc_viewFilter span[fontColor='"+userConfig.lastViewFilter+"']").index();
				forwardIndex++;
				if(forwardIndex >= $viewFilterObj.length) forwardIndex = 0;
				let viewFilter = $viewFilterObj.eq(forwardIndex).attr("fontColor");
				appMethod.setUserConfig("lastViewFilter", viewFilter);
				break;
			case 'background':
				let $viewFilterObj = $("#mFunc_viewFilter li[viewClass='background']").find("span");
				let forwardIndex = $("#mFunc_viewFilter span[bgColor='"+userConfig.lastViewFilter+"']").index();
				forwardIndex++;
				if(forwardIndex >= $viewFilterObj.length) forwardIndex = 0;
				let viewFilter = $viewFilterObj.eq(forwardIndex).attr("bgColor");
				appMethod.setUserConfig("lastViewFilter", viewFilter);
				break;
			case 'tag':
				let $viewFilterObj = $("#mFunc_viewFilter li[viewClass='tag']").find("span");
				let forwardIndex = $("#mFunc_viewFilter span[tagColor='"+userConfig.lastViewFilter+"']").index();
				forwardIndex++;
				if(forwardIndex >= $viewFilterObj.length) forwardIndex = 0;
				let viewFilter = $viewFilterObj.eq(forwardIndex).attr("tagColor");
				appMethod.setUserConfig("lastViewFilter", viewFilter);
				break;
			case 'label':
				let $viewFilterObj = $("#mFunc_viewFilter li[viewClass='label']").find("i");
				let forwardIndex = $("#mFunc_viewFilter i[labelKey='"+userConfig.lastViewFilter+"']").index();
				forwardIndex++;
				if(forwardIndex >= $viewFilterObj.length) forwardIndex = 0;
				let viewFilter = $viewFilterObj.eq(forwardIndex).attr("labelKey");
				appMethod.setUserConfig("lastViewFilter", viewFilter);
				break;
			default:
				break;
		}
		getMemoList(true);
		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"swipeMemoList"});
	}
}
function page_swiperight() {
	if(!onEdit) {
		var userConfig = appMethod.getUserConfig();
		switch(userConfig.lastViewClass) {
			case 'date':
				var showDate = new Date(appMethod.getShowDate());
				showDate.setDate( showDate.getDate() - 1 );
				var tomorrow = new Date();
				tomorrow.setDate( tomorrow.getDate() + 1 );

				if(userConfig.lastViewFilter == "Today") appMethod.setUserConfig("lastViewFilter", "Yesterday");
				else if(userConfig.lastViewFilter == "Tomorrow") appMethod.setUserConfig("lastViewFilter", "Today");
				else if(appMethod.formateDate(showDate) == appMethod.formateDate(tomorrow)) appMethod.setUserConfig("lastViewFilter", "Tomorrow");
				else appMethod.setUserConfig("lastViewFilter", appMethod.formateDate(showDate));

				break;
			case 'bold':
				if(userConfig.lastViewFilter == "粗字體") appMethod.setUserConfig("lastViewFilter", "細字體");
				else appMethod.setUserConfig("lastViewFilter", "粗字體");
				break;
			case 'color':
				let $viewFilterObj = $("#mFunc_viewFilter li[viewClass='color']").find("span");
				let forwardIndex = $("#mFunc_viewFilter span[fontColor='"+userConfig.lastViewFilter+"']").index();
				forwardIndex--;
				if(forwardIndex < 0) forwardIndex = $viewFilterObj.length - 1;
				let viewFilter = $viewFilterObj.eq(forwardIndex).attr("fontColor");
				appMethod.setUserConfig("lastViewFilter", viewFilter);
				break;
			case 'background':
				let $viewFilterObj = $("#mFunc_viewFilter li[viewClass='background']").find("span");
				let forwardIndex = $("#mFunc_viewFilter span[bgColor='"+userConfig.lastViewFilter+"']").index();
				forwardIndex--;
				if(forwardIndex < 0) forwardIndex = $viewFilterObj.length - 1;
				let viewFilter = $viewFilterObj.eq(forwardIndex).attr("bgColor");
				appMethod.setUserConfig("lastViewFilter", viewFilter);
				break;
			case 'tag':
				let $viewFilterObj = $("#mFunc_viewFilter li[viewClass='tag']").find("span");
				let forwardIndex = $("#mFunc_viewFilter span[tagColor='"+userConfig.lastViewFilter+"']").index();
				forwardIndex--;
				if(forwardIndex < 0) forwardIndex = $viewFilterObj.length - 1;
				let viewFilter = $viewFilterObj.eq(forwardIndex).attr("tagColor");
				appMethod.setUserConfig("lastViewFilter", viewFilter);
				break;
			case 'label':
				let $viewFilterObj = $("#mFunc_viewFilter li[viewClass='label']").find("i");
				let forwardIndex = $("#mFunc_viewFilter i[labelKey='"+userConfig.lastViewFilter+"']").index();
				forwardIndex--;
				if(forwardIndex < 0) forwardIndex = $viewFilterObj.length - 1;
				let viewFilter = $viewFilterObj.eq(forwardIndex).attr("labelKey");
				appMethod.setUserConfig("lastViewFilter", viewFilter);
				break;
			default:
				break;
		}
		getMemoList(true);
		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"swipeMemoList"});
	}
}
function showFilterTitle() {		//顯示記事類型標題
	var $viewType = $("#viewType p");
	var userConfig = appMethod.getUserConfig();
	$viewType.css("color", "");
	$viewType.css("font-weight", "");
	switch(userConfig.lastViewClass) {
		case 'date':
		case 'bold':
			$viewType.text(userConfig.lastViewFilter);
			break;
		case 'color':
			$viewType.css("font-weight", "bold");
			$viewType.css("color", userConfig.lastViewFilter);
			$viewType.text("文字顏色");
			break;
		case 'background':
			$viewType.css("font-weight", "bold");
			$viewType.css("color", userConfig.lastViewFilter);
			$viewType.text("背景顏色");
			break;
		case 'tag':
			$viewType.css("font-weight", "bold");
			$viewType.css("color", userConfig.lastViewFilter);
			$viewType.text("標籤顏色");
			break;
		case 'label':
			var semicolon = userConfig.lastViewFilter.indexOf(";");
			var iconName = userConfig.lastViewFilter.substring(0, semicolon);
			var iconColor = userConfig.lastViewFilter.substring(semicolon + 1, userConfig.lastViewFilter.length);
			$viewType.html("<i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/"+appMethod.getColorDir(iconColor)+"/"+iconName+".svg);\"></i>");
			break;
		default:
			$viewType.text("未指定");
			break;
	}
	GoogleAnalytics.trackView("memoList-"+userConfig.lastViewClass);
}
function memoEditCancel() {
	$("#memoEdit input[type='text']").val("");
	$("#memoEdit li p").html("");	//清除所有內容
	$("#memoEdit li[type=bold] p").css("font-weight", "400");
	$("#memoEdit li[type=bold] p").text("細");
	$("#memoEdit .menu_right").remove();
	$("#memoEdit").hide();
	appMethod.logCloseMenu("#memoEdit");
	appMethod.resetEditor();
}
function memoEditOpen() {		//開啟修改記事編輯器，讀取原本的記事設定
	$("#memoEdit .tip").text("修改記事");
	$("#memoEdit li[type=date]").attr("onclick", "appMethod.openDatePicker('#memoEdit li[type=date] p', false);");
	if($("#memoEdit .menu_bottom .menu_right").length == 0)
		$("#memoEdit .menu_bottom").append("<button class=\"menu_right\" onclick=\"memoEdit()\"><i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/000000/edit.svg);\"></i>修改</button>");
	var $memoRecord = $("#memoList li[memoID="+memoSelectID+"]");
	var $memoText = $($memoRecord.find("p")[0]);
	$("#memoEdit li.memoInput input").val( $memoText.text() );

	appMethod.resetEditor();
	appMethod.editor.startDate = new Date( $memoRecord.attr("date") ).getTime();
	appMethod.editor.endDate = appMethod.editor.startDate;
	$("#memoEdit li[type=date] p").text( $memoRecord.attr("date") );
	//group?
	//無論是否有設定，.css都抓得到值，所以用無設定的物件來判斷是否有設定值
	var color = $memoRecord.css("color");
	if(color != $memoRecord.parent().css("color")) {
		color = rgbToHex(color);
		$("#memoEdit li[type=color] p").append("<span style=\"background-color:"+color+"\"></span>");
		appMethod.editor.color = color;
	}
	if($memoText.css("font-weight") == $memoRecord.css("font-weight")) {
		$("#memoEdit li[type=bold] p").css("font-weight", "400");
		$("#memoEdit li[type=bold] p").text("細");
	}
	else {
		$("#memoEdit li[type=bold] p").css("font-weight", "bold");
		$("#memoEdit li[type=bold] p").text("粗");
		appMethod.editor.bold = 1;
	}
	var background = $memoRecord.css("background-color");
	if(background != $memoText.css("background-color")) {
		background = rgbToHex(background);
		$("#memoEdit li[type=background] p").append("<span style=\"background-color:"+background+"\"></span>");
		appMethod.editor.background = background;
	}
	if($memoRecord.find(".label")) {
		$("#memoEdit li[type=label] p").append( $memoRecord.find(".label").html() );
		var $labelObj = $("#memoEdit li[type=label] p i");
		if( $labelObj.length != 0 ) {
			appMethod.editor.label = $labelObj.attr("name") + ";" + $labelObj.attr("color");
		}
	}
	if($memoRecord.find(".tags")) {
		var $tags = $memoRecord.find(".tag");
		var tags_len = $tags.length;
		for(var i=0; i<tags_len; i++) {
			$($tags[i]).clone().removeClass("tag").appendTo("#memoEdit li[type=tag] p");
		}
		appMethod.editor.tag = appMethod.getColorTicket( $("#memoEdit li[type=tag] p span") ).join(";");
	}
	$("#memoEdit").show();
	appMethod.logOpenMenu("#memoEdit", "memoEditCancel()");
	GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"openMemoEditor"});
}
function memoAdd() {
	//檢查記事內容
	appMethod.showLoading(config.message.saveMemo.title, config.message.saveMemo.content);
	var memoText = htmlEncode( $("#memoEdit input[type='text']").val() );
	if(memoText == "") appMethod.alert("noContent", function() {});
	else {
		var memoStartDate = new Date(appMethod.editor.startDate);
		var memoEndDate = new Date(appMethod.editor.endDate);
		var group_id = -1;

		var startID = lastMemoID;
		var inserted = 0;			//已新增的資料筆數
		if(memoStartDate != memoEndDate) GoogleAnalytics.trackEvent("select_content", {content_type:"indicator", item_id:"addMultipleMemo"});
		while(memoStartDate <= memoEndDate) {
			lastMemoID++;
			let memoID = lastMemoID;	//iOS無法使用let
			let memoDate = appMethod.formateDate(memoStartDate);
			appMethod.insertData("memo", {
				memo_id: memoID,
				date: memoDate,
				title: memoText,
				remarks: "",
				color: appMethod.editor.color,
				bold: appMethod.editor.bold,
				background: appMethod.editor.background,
				label: appMethod.editor.label,
				tag: appMethod.editor.tag,
				group_id: -1,
				finished: 0,
				order: 0,
				sealed: 0,
				timestamp: Date.now()
			}, function(){
				inserted++;
				GoogleAnalytics.trackEvent("select_content", {content_type:"modifyData", item_id:"addMemo"});
				if(inserted >= lastMemoID - startID) location.reload();	//所有資料都新增完成，重新顯示面板
			});
			memoStartDate.setDate( memoStartDate.getDate() + 1 );	//新增完成，開始日期+1
		}
		// getMemoList(false);
		// memoEditCancel();
	}
}
function memoEdit() {	//儲存修改的記事內容
	appMethod.showLoading(config.message.saveMemo.title, config.message.saveMemo.content);
	var memoText = $("#memoEdit input[type='text']").val();
	var memoDate = $("#memoEdit li[type=date] p").text();
	var group_id = -1;

	appMethod.updateData("memo", {memo_id: memoSelectID}, {
		date: memoDate,
		title: memoText,
		color: appMethod.editor.color,
		bold: appMethod.editor.bold,
		background: appMethod.editor.background,
		label: appMethod.editor.label,
		tag: appMethod.editor.tag,
		group_id: group_id,
		timestamp: Date.now()
	}, function() {
		// getMemoList(false);		//從資料庫刷新目前的記事頁面
		// $(".menuList").hide();
		GoogleAnalytics.trackEvent("select_content", {content_type:"modifyData", item_id:"updateMemo"});
		location.reload();
	});
}
function memoDelete() {
	appMethod.confirm("memoDel", function(buttonIndex) {
		if(buttonIndex == 1) {	//開啟程式頁面
			$("#memoList li[memoID="+memoSelectID+"]").remove();
			appMethod.db.transaction(function(tx) {
				tx.executeSql('DELETE FROM `memo` WHERE `memo_id` = ?', [memoSelectID]);
			});
			GoogleAnalytics.trackEvent("select_content", {content_type:"modifyData", item_id:"delMemo"});
			$("#menu_record").hide();
			appMethod.logCloseMenu("#menu_record");
			checkEmpty();
		}
	});
}
function memoClear(animate) {	//清除目前列表上的記事
	// if(animate) {
	// 	let $memoRecord = $("#memoList li");
	// 	for(let i=0; i<$memoRecord.length; i++) {
	// 		setTimeout(function() {
	// 			$( $memoRecord[i] ).fadeOut( 400, function() { $(this).remove(); } );
	// 		}, 300 * i);
	// 	}
	// }
	$("#memoList li").remove();
}
function checkEmpty() {
	var memo_count = $("#memoList ul li").length;
	if(memo_count == $("#memoList ul li:hidden").length)
		$("#memoList ul").append("<li class=\"noneMemo\">目前沒有記事</li>");
	else $("#memoList ul li.noneMemo").remove();
}
function openRemarkEdit($target, color) {
	onEdit = true;
	var $editbox = $target.parent();
	var remarkText = $target.html();	//取得備註內容
	remarkText = replaceAll(remarkText, "<br>", "\n");
	remarkText = replaceAll(remarkText, "<br />", "\n");

	$editbox.html("");
	var form = $("<form onsubmit=\"return false\"></form>");
	form.append("<textarea placeholder=\"請輸入您的記事備註\" style=\"color:"+color+"\">"+remarkText+"</textarea>");
	form.append("<button onclick=\"remarkSave(this)\" class=\"editbox_left\">儲存</button>");
	form.append("<button onclick=\"remarkReset(this)\">復原</button>");
	form.append("<button onclick=\"remarkClose(this)\" class=\"editbox_right\">關閉</button>");
	form.appendTo($editbox);
	GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"openRemarkEditor"});
}
function remarkSave(btnObj) {
	var $target = $(btnObj).parent().parent();
	var remarkText = replaceAll( htmlEncode($target.find("textarea").val()), "\n", "<br />");
	$target.html("<p class=\"memoRemark\">"+remarkText+"</p>");
	
	appMethod.updateData("memo", {memo_id: memoSelectID}, {
		remarks: remarkText,
		timestamp: Date.now()
	}, function() {
		onEdit = false;
		if(remarkText == "") {
			$target.hide();	//沒有記事，關閉時直接隱藏
			$target.parent().find("p.fullMemo").removeClass("fullMemo");
		}
		GoogleAnalytics.trackEvent("select_content", {content_type:"modifyData", item_id:"updateRemark"});
	});
}
function remarkReset(btnObj) {
	var $target = $(btnObj).parent();

	var newText = $target.parent().find("textarea").val();
	$target[0].reset();
	var oldText = $target.parent().find("textarea").val();

	if(newText != oldText) {	//比較新舊備註，避免修改後誤觸關閉
		appMethod.confirm("remarkCancel", function(buttonIndex) {
			if(buttonIndex != 1) {	//取消修改備註
				$target.parent().find("textarea").val(newText);
				GoogleAnalytics.trackEvent("select_content", {content_type:"indicator", item_id:"cancelRemarkReset"});
			}
		});
	}
}
function remarkClose(btnObj) {
	remarkReset(btnObj);
	var $target = $(btnObj).parent().parent();
	var remarkText = replaceAll($target.find("textarea").val(), "\n", "<br />");
	$target.html("<p class=\"memoRemark\">"+remarkText+"</p>");
	onEdit = false;

	if(remarkText == "") {
		$target.hide();	//沒有記事，關閉時直接隱藏
		$target.parent().find("p.fullMemo").removeClass("fullMemo");
	}
}
function menuFuncitonClose() {
	appMethod.logCloseMenu("#menu_function");
	$("#menu_function").hide();
}
function openViewClass() {
	//開啟清單顯示種類，隱藏目前的清單種類
	var userConfig = appMethod.getUserConfig();
	$("#mFunc_viewClass li[empty != true]").show();
	$("#mFunc_viewClass li[viewClass = '"+userConfig.lastViewClass+"']").hide();
	$('#mFunc_viewClass').show();
	menuFuncitonClose();
	appMethod.logOpenMenu("#mFunc_viewClass");
	GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"openViewClass"});
}
function openViewFilter(viewClass) {
	switch(viewClass) {
		case 'date':
			$("#mFunc_viewFilter .tip").text("");
			var calendar = $("#mFunc_viewFilter #calendar").data("kendoCalendar");
			var showDate = appMethod.getShowDate();
			if(showDate) calendar.value(new Date( showDate ));
			else calendar.value(null);
			break;
		case 'bold':
			$("#mFunc_viewFilter .tip").text("請選擇文字粗細");
			break;
		case 'color':
			$("#mFunc_viewFilter .tip").text("請選擇文字顏色");
			break;
		case 'background':
			$("#mFunc_viewFilter .tip").text("請選擇背景顏色");
			break;
		case 'tag':
			$("#mFunc_viewFilter .tip").text("請選擇標籤顏色");
			break;
		case 'label':
			$("#mFunc_viewFilter .tip").text("請選擇圖示");
			break;
		default:
			break;
	}
	//開啟清單內容，僅顯示指定種類
	$("#mFunc_viewFilter li:lt(-1)").hide();
	$("#mFunc_viewFilter .tip").show();
	$("#mFunc_viewFilter li[viewClass='"+viewClass+"']").show();
	$('#mFunc_viewFilter').show();
	if(viewClass == "date") $("#mFunc_viewFilter #calendar").width( $("#mFunc_viewFilter li.tip").innerWidth() - 2 );
	appMethod.logOpenMenu("#mFunc_viewFilter");

	GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"openViewFilter"});
}
function viewClassSelected(viewClass) {
	if(viewClass == "date") {
		appMethod.setUserConfig("lastViewClass", "date");
		appMethod.setUserConfig("lastViewFilter", "Today");
		getMemoList(true);
		$(".menuList").hide();
		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"defaultViewFilter"});
	}
	else openViewFilter(viewClass);
}
function shSwitch() {
	if($("#menu_function .viewHide i").hasClass("hideFinish")) {
		appMethod.setUserConfig("showOrHide", "hide");
		$("#menu_function .viewHide").html("<i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/000000/check_box.svg);\"></i>顯示已完成事項");
		$("#memoList li[class='done']").hide();
	}
	else {
		appMethod.setUserConfig("showOrHide", "show");
		$("#menu_function .viewHide").html("<i class=\"material-icons hideFinish\" style=\"background-image: url(library/GoogleMaterialIcons/000000/indeterminate_check_box.svg);\"></i>隱藏已完成事項");
		$("#memoList li[class='done']").show();
	}
	checkEmpty();
	menuFuncitonClose();
	GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"switchFinished"});
}
function cloneFormInit() {		//建立複製於與至的日期選擇器
	$("#cloneFromPicker").kendoDatePicker({
		open: function() {
			var calendar = this.dateView.calendar;
			calendar.wrapper.width(350);
			appMethod.logOpenMenu("#kendoDatePicker", "lock");
		},
		change: function() {
			var startDate = $("#cloneFromPicker").val();
			$("#cloneFrom").text(startDate);
			var cloneToPicker = $("#cloneToPicker").data("kendoDatePicker");
			cloneToPicker.min( new Date(startDate) );
			cloneToPicker.value( new Date(startDate) );
			$("#cloneTo").text( startDate );
			appMethod.logCloseMenu("#kendoDatePicker");
		},
		depth: "month",
		format: "yyyy.MM.dd",
		footer: false
	}).addClass("datePicker");
	$("#cloneToPicker").kendoDatePicker({
		open: function() {
			var calendar = this.dateView.calendar;
			calendar.wrapper.width(350);
			appMethod.logOpenMenu("#kendoDatePicker", "lock");
		},
		change: function() {
			var endDate = $("#cloneToPicker").val();
			$("#cloneTo").text(endDate);
			var cloneFromPicker = $("#cloneFromPicker").data("kendoDatePicker");
			cloneFromPicker.max( new Date(endDate) );
			appMethod.logCloseMenu("#kendoDatePicker");
		},
		format: "yyyy.MM.dd",
		footer: false
	}).addClass("datePicker");
	$(".datePicker").hide();

	$("#mFunc_clone li.cloneDate").click(function(){
		if( $(this).find("i.calendar").length != 0) {
			var datepicker = $(this).find("input").data("kendoDatePicker");
			datepicker.open();
		}
	});
}
function cloneFormClose() {		//關閉複制視窗，重置參數
	$("#mFunc_clone").hide();
	var cloneToPicker = $("#cloneToPicker").data("kendoDatePicker");
	cloneToPicker.value(new Date());
	cloneToPicker.max(new Date(2099, 12, 31));
	var cloneFromPicker = $("#cloneFromPicker").data("kendoDatePicker");
	cloneFromPicker.value(new Date());
	cloneFromPicker.min(new Date(1900, 1, 1));
	$("#mFunc_clone li").show();	//顯示所有隱藏欄位
	$("#cloneFrom").text("");
	$("#cloneTo").text("");
	appMethod.logCloseMenu("#kendoDatePicker");
	appMethod.logCloseMenu("#mFunc_clone");
}
function moveOneTo() {		//移動記事，使用複製的表單
	$("#mFunc_clone").attr("active", "moveOneTo");
	$("#mFunc_clone .includeFinished").hide();
	$("#mFunc_clone .tip").text("移動至…");
	$("#mFunc_clone .cloneTo").hide();
	$("#mFunc_clone").show();
	appMethod.logOpenMenu("#mFunc_clone", "cloneFormClose()");
	GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"openMoveOneTo"});
}
function cloneOneTo() {		//複製指定的記事，隱藏「包括已完成事項」選項
	$("#mFunc_clone").attr("active", "cloneOneTo");
	$("#mFunc_clone .includeFinished").hide();
	$("#mFunc_clone .tip").text("複製至…");
	$("#mFunc_clone").show();
	appMethod.logOpenMenu("#mFunc_clone", "cloneFormClose()");
	GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"openCloneOneTo"});
}
function cloneMultipleTo() {	//複製目前頁面上的所有記事
	$("#mFunc_clone").attr("active", "cloneMultipleTo");
	$("#mFunc_clone .tip").text("複製至…");
	$("#mFunc_clone").show();
	appMethod.logOpenMenu("#mFunc_clone", "cloneFormClose()");
	GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"openCloneMultipleTo"});
}
function cloneMultipleFrom() {	//複製指定日期的所有記事到目前頁面的日期
	$("#mFunc_clone").attr("active", "cloneMultipleFrom");
	$("#mFunc_clone .tip").text("複製於…");
	$("#mFunc_clone .cloneTo").hide();
	$("#mFunc_clone").show();
	appMethod.logOpenMenu("#mFunc_clone", "cloneFormClose()");
	GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"openCloneForm"});
}
function cloneConfirm() {
	var active = $("#mFunc_clone").attr("active");	//複製的種類
	var includeFinished = $("#mFunc_clone input[name=include]").prop("checked");
	var cloneFrom = $("#cloneFromPicker").val();
	var cloneTo = $("#cloneToPicker").val();
	appMethod.logCloseMenu("#mFunc_clone");

	if(cloneFrom || cloneTo) {
		if(active == "moveOneTo") {		//移動記事
			GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"moveOneTo"});
			appMethod.updateData("memo", {memo_id: memoSelectID}, {
				date: cloneFrom,
				timestamp: Date.now()
			}, function() {
				$(".menuList").hide();
				appMethod.logMenuClear();
				GoogleAnalytics.trackEvent("select_content", {content_type:"modifyData", item_id:"moveMemoTo"});
				var userConfig = appMethod.getUserConfig();
				appMethod.toast("moveMemoFinished", function(){
					if(userConfig.lastViewClass == "date") location.reload();
				});
			});
		}
		else if(active == "cloneMultipleFrom") {		//從指定日期複製到當前日期
			let sqlStr = "SELECT * FROM `memo` WHERE `date` = ? AND `sealed` = 0";
			if(!includeFinished) sqlStr += " AND `finished` = 0";
			GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"cloneMultipleFrom"});

			let startID = lastMemoID;
			let inserted = 0;			//已新增的資料筆數
			appMethod.db.transaction(function(tx) {
				tx.executeSql(sqlStr, [cloneFrom], function(tx, rs) {
					var showDate = appMethod.getShowDate();
					var len = rs.rows.length;
					for(var i=0; i<len; i++) {
						lastMemoID++;
						var memo_record = rs.rows.item(i);
						memo_record.memo_id = lastMemoID;
						memo_record.date = showDate;
						memo_record.remarks = "";
						memo_record.finished = 0;
						memo_record.sealed = 0;
						memo_record.timestamp = Date.now();

						appMethod.insertData("memo", memo_record, function(){
							inserted++;
							GoogleAnalytics.trackEvent("select_content", {content_type:"modifyData", item_id:"cloneMemoFrom"});
							if(inserted >= lastMemoID - startID) {	//所有資料都新增完成，重新顯示面板
								$(".menuList").hide();
								appMethod.logMenuClear();
								getMemoList(false);
							}
						});
					}
				}, function(tx, error) {
				});
			});
		}
		else {
			var memo_clone_id = [];	//轉存的物件ID
			let sqlStr = "SELECT * FROM `memo` WHERE `memo_id` ";
			if(active == "cloneOneTo") {
				memo_clone_id.push(memoSelectID);
				GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"cloneOneTo"});
			}
			else {
				var $memo_record = $("#memoList li");
				var len = $memo_record.length;
				for(var i=0; i<len; i++) {
					var finished = $($memo_record[i]).find("input").prop("checked");	//此筆是否已完成
					if( !(!includeFinished && finished) ) memo_clone_id.push( $($memo_record[i]).attr("memoID") );
				}
				GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"cloneMultipleTo"});
			}
			if(memo_clone_id.length == 1) sqlStr += "= " + memo_clone_id[0];
			else sqlStr += "IN ("+memo_clone_id.join(",")+")";

			let startID = lastMemoID;
			let inserted = 0;			//已新增的資料筆數
			appMethod.db.transaction(function(tx) {
				tx.executeSql(sqlStr, [], function(tx, rs) {
					var len = rs.rows.length;
					for(var i=0; i<len; i++) {
						var memo_record = rs.rows.item(i);
						var cloneFromDate = new Date(cloneFrom);
						var cloneToDate = new Date(cloneTo);

						while(cloneFromDate <= cloneToDate) {
							lastMemoID++;
							memo_record.memo_id = lastMemoID;
							memo_record.date = appMethod.formateDate(cloneFromDate);;
							memo_record.remarks = "";
							memo_record.finished = 0;
							memo_record.sealed = 0;
							memo_record.timestamp = Date.now();

							appMethod.insertData("memo", memo_record, function(){
								inserted++;
								GoogleAnalytics.trackEvent("select_content", {content_type:"modifyData", item_id:"cloneMemoTo"});
								if(inserted >= lastMemoID - startID) {	//所有資料都新增完成，重新顯示面板
									$(".menuList").hide();
									appMethod.logMenuClear();
									if(active == "cloneOneTo") {	//單筆複制，若非日期模式時重新整理
										var userConfig = appMethod.getUserConfig();
										appMethod.toast("cloneMemoFinished", function(){
											if(userConfig.lastViewClass != "date") location.reload();
										});
									}
									else {
										appMethod.toast("cloneMemoFinished");	//提示完成訊息
									}
								}
							});
							cloneFromDate.setDate( cloneFromDate.getDate() + 1 );	//新增完成，開始日期+1
						}
					}
				}, function(tx, error) {});
			});
		}
	}
}

if(config.onDebugMode) {
	$(document).ready(function () {
        onDeviceReady();
	});
}
else {
    //從http網址導入app時，執行此func，註冊事件名稱參照config.xml
    universalLinks.subscribe('ul_mainPage', function (eventData) {
        alert('Did launch application from the link: ' + eventData.url);
	});
}

document.addEventListener("backbutton", onBackKeyDown, false);
function onBackKeyDown() {
	if(appMethod.menuOpenLogs.length > 0) {
		var closeTagObj = appMethod.menuOpenLogs.pop();
		if(!closeTagObj.closeFunc) $(closeTagObj.selector).hide();
		else {
			appMethod.menuOpenLogs.push(closeTagObj);
			window.setTimeout(closeTagObj.closeFunc, 1);
		}
	}
	else navigator.app.exitApp();
}
