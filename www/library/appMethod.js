var config = {	//應用程式設定參數
	appName: "meMoke",
	appPackage: "tw.moke.memo",
	appVersion: 10,
	downloadPage:"https://play.google.com/store/apps/details?id=tw.moke.memo",
    adMobID: {
        banner: "ca-app-pub-9290092190911637/5977730288",
        interstitial: "ca-app-pub-9290092190911637/7761209884"
    },
	iosConfig: {
		downloadPage:"https://www.moke.tw",
		adMobID: {
			banner: "ca-app-pub-9290092190911637/5977730288",
			interstitial: "ca-app-pub-9290092190911637/7761209884"
		}
	},

	defaultADdelay: 10,		//預設全版廣告間隔(分鐘)
	defaultUserConfig: {
		lastViewClass:"date",
		lastViewFilter:"Today",
		showOrHide:"show"
	},

	onDebugMode: false,

	message: {
		loadingMemo:{title:"載入資料中", content:"正在為您載入記事內容，請稍候…"},
		loadingAD:{title:"載入廣告中", content:"請耐心等候，不便之處請見諒。"},
		initDBfailed:{title:"資料庫存取失敗", content:"抱歉，您的系統無法存取資料庫，以致於無法使用本服務。\n造成您的不便請見諒。"},
		newVersion:{title:"找到新的版本", content:"發現新版本的應用程式，您要立即更新嗎？", btnLabel:["更新","關閉"]},
		forceUpgrade:{title:"請安裝新的版本", content:"您目前的版本已無法使用，請更新至最新版本再使用。\n您要立即更新嗎？", btnLabel:["更新","離開"]},
		forceBlock:"您目前的版本已無法使用，請重新啟動應用程式以開啟更新程序，造成您的不便請您見諒。",
		saveMemo:{title:"儲存中", content:"正在為您儲存記事，請稍候…"},
		noContent:{title:"內容未填寫", content:"請填寫內容後再進行操作。", btnLabel:"確定"},
		memoDel:{title:"刪除記事", content:"您確定要刪除此筆記事?\n※注意：此操作無法還原。", btnLabel:["刪除","取消"]},
		remarkCancel:{title:"備註未存檔", content:"您所修改的備註尚未儲存，要繼續此操作還原成修改前的內容嗎？", btnLabel:["確定","取消"]},
		moveMemoFinished:{content:"移動完成。"},
		cloneMemoFinished:{content:"複製完成。"}
	},

	//iconWord:["at", "browser", "bug", "cloud", "code", "comment outline", "comment", "comments outline", "comments", "copyright", "dashboard", "feed", "find", "hashtag", "heartbeat", "idea", "lab", "privacy", "protect", "shop", "shopping bag", "shopping basket", "trophy", "wifi", "archive", "ban", "bookmark", "call", "cloud download", "cloud upload", "talk", "talk outline", "edit", "lock", "pin", "print", "recycle", "refresh", "send", "send outline", "theme", "translate", "unhide", "unlock", "upload", "wait", "write", "write square"]
	iconWord:["star", "star_half", "star_border", "ac_unit", "beach_access", "business_center", "casino", "fitness_center", "free_breakfast", "golf_course", "hot_tub", "kitchen", "pool", "spa", "cake", "domain", "group", "person", "location_city", "poll", "public", "school", "mood", "mood_bad", "sentiment_dissatisfied", "sentiment_neutral", "sentiment_satisfied", "sentiment_very_dissatisfied", "child_care", "child_friendly", "sentiment_very_satisfied", "whatshot", "account_balance", "android", "bug_report", "card_giftcard", "card_membership", "card_travel", "credit_card", "delete", "event", "event_seat", "explore", "extension", "face", "favorite", "favorite_border", "home", "hourglass_full", "lock", "pets", "print", "query_builder", "redeem", "shopping_basket", "shopping_cart", "import_contacts", "flag", "mail", "weekend", "headset", "toys", "tv", "videogame_asset", "watch", "directions_bike", "airport_shuttle", "drive_eta", "motorcycle", "directions_boat", "airplanemode_active", "restaurant", "restaurant_menu", "local_florist"]
};
if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // ios config
    for(var key in config.iosConfig) {
		config[key] = config.iosConfig[key];
	}
};

function appCheckFinish() {}

var GoogleAnalytics = {
	init: function() {
	},
	trackView: function (title, url) {
		if(!config.onDebugMode) {
			window.FirebasePlugin.setScreenName(title);
		}
	},
	trackEvent: function (eventName, param) {
		if(!config.onDebugMode) {
			//https://support.google.com/firebase/answer/6317498?hl=zh-Hant&ref_topic=6317484
			window.FirebasePlugin.logEvent(eventName, param);
		}
	},
	setUser: function(user_id) {
		if(!config.onDebugMode) {
			window.FirebasePlugin.setUserId(user_id);
		}
	},
	setUserProperty: function(property, value) {
		if(!config.onDebugMode) {
			window.FirebasePlugin.setUserProperty(property, value);
		}
	}
};
var appPush = { //推播
    init: function() {
		if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // ios
			window.FirebasePlugin.hasPermission(function(data) {
				adMobFun.setUserConfig("pushOpen", data.isEnabled);
				if(!data.isEnabled) window.FirebasePlugin.grantPermission();
			});
		};
    },
    register: function() {
		if(!config.onDebugMode) {
			appPush.init();
			window.FirebasePlugin.getToken(function(token) {
				appPush.addMember(token);
			}, function(error) {
				appPush.error(error);
			});
			window.FirebasePlugin.onTokenRefresh(function(token) {
				appPush.addMember(token);
			}, function(error) {
				appPush.error(error);
			});
		}
    },
    notification: function() {
		if(!config.onDebugMode) {
			//The plugin will look for and use notification_icon in drawable resources if it exists, otherwise the default app icon will is used.
			window.FirebasePlugin.onNotificationOpen(function(notification) {
				// if(notification.from) {		//從背景開啟
				// }
				// else {		//從前景開啟
				// }
			}, function(error) {
				appPush.error(error);
			});
		}
    },
    error: function(error) {
		console.error(error);
    },
    addMember: function(token) {
    },
    subscribe: function(topic) {
		if(!config.onDebugMode) {
			window.FirebasePlugin.subscribe(topic);
		}
    },
    unsubscribe: function(topic) {
		if(!config.onDebugMode) {
			window.FirebasePlugin.unsubscribe(topic);
		}
    },
    setAppIconNum: function() {
		if(!config.onDebugMode) {
			window.FirebasePlugin.getBadgeNumber(function(n) {
				window.FirebasePlugin.setBadgeNumber(n+1);
			});
		}
    },
	clearAppIconNum: function() {
		window.FirebasePlugin.setBadgeNumber(0);
	}
};
var adMobFun = {   //廣告
	isBannerShow: false,
	showTag: config.adMobID.banner,
	showBanner: function(tag) {
		if(adMobFun.isBannerShow) AdMob.removeBanner();	//廣告已經存在，先移除
		
		if(tag != null) adMobFun.showTag = tag;
		if(config.onDebugMode) console.log("adMobFun.showBanner: "+adMobFun.showTag);
		else {
			adMobFun.isBannerShow = true;
			AdMob.createBanner({
				adId: adMobFun.showTag,
				position: AdMob.AD_POSITION.BOTTOM_CENTER,
				autoShow: true
			});
		}
    },
	removeBanner: function() {
		adMobFun.isBannerShow = false;
		if(!config.onDebugMode) AdMob.removeBanner();
	},
	prepareInterstitial: function(autoShow) {
		if(config.onDebugMode) console.log("adMobFun.prepareInterstitial");
		else {
			if (!navigator.userAgent.match(/Tablet|iPad/i)) {	//平版的全版廣告有問題，暫時排除
				if(!autoShow) autoShow = false;
				AdMob.prepareInterstitial( {adId:config.adMobID.interstitial, autoShow: autoShow}, function() {
					adMobFun.isADready = true;
				}, function() {
					adMobFun.isADready = false;
				});
			}
		}
    },
	showInterstitial: function(prepare) {	//顯示插頁，是否預備廣告
		if(config.onDebugMode) {
			var now = new Date();
			sessionStorage.adShowTime = now.getTime();
			console.log("adMobFun.showInterstitial");
		}
		else if(adMobFun.isADready) AdMob.showInterstitial();
		else AdMob.isInterstitialReady(function(ready){
			if(ready) AdMob.showInterstitial();
			else if(prepare) {	//是否進行預備廣告
				appMethod.closeLoading();
				adMobFun.prepareInterstitial(false);
			}
			else {
				adMobFun.prepareInterstitial(true);
			}
		});
    },
	closeInterstitial: function() {
		var now = new Date();
		sessionStorage.adShowTime = now.getTime();
		appMethod.closeLoading();
		adMobFun.isADready = false;
	}
};
document.addEventListener('onAdLeaveApp', function(e) {
    adMobFun.closeInterstitial();
});
document.addEventListener('onAdDismiss', function(e) {
    adMobFun.closeInterstitial();
});
document.addEventListener('onAdFailLoad', function(e) {
    adMobFun.closeInterstitial();
});

var RemoteConfig = {
	fetched: false,
	init: function(callback) {
		if(!config.onDebugMode) {
			window.FirebasePlugin.fetch();
			window.FirebasePlugin.activateFetched(function(activated) {
				// activated will be true if there was a fetched config activated,
				// or false if no fetched config was found, or the fetched config was already activated.
				RemoteConfig.fetched = true;
				callback.call(callback);
			}, function(error) {
				callback.call(callback);
			});
		}
		else callback.call(callback);
	},
	getValue: function(key, callback) {
		if(!config.onDebugMode && RemoteConfig.fetched) {
			window.FirebasePlugin.getValue(key, function(value) {
				callback.call(callback, value);
			}, function(error) {
				callback.call(callback, null);
			});
		}
		else callback.call(callback, null);
	}
}

document.addEventListener("resume", onResume, false);
function onResume() {
	if(appMethod.showAD()) adMobFun.showInterstitial(true);	//顯示全版廣告
}

var appMethod = {
	introCount:3,
	dbTable: {				//資料庫的欄位
		memo:["memo_id", "date", "title", "remarks", "color", "bold", "background", "label", "tag", "group_id", "finished", "order", "sealed", "timestamp"],
		groups:["group_id", "name", "color", "bold", "background", "label", "tag", "order", "sealed", "timestamp"]
	},
	db: null,	//資料庫變數
	tempSelector: null,		//選擇器標籤暫存
	tempCallback: null,		//選擇器回呼
	defaultIconColor: "34AC8B",
	colorLimit: 1,			//色票選擇限制
	editor:{},				//將編輯資料存入記憶體
	userConfig:{},			//將使用者設定存入記憶體
	menuOpenLogs:[],		//記錄目前開啟的選單狀態
    checkVersion: function() {	/* →appCheckFinish() */
		var version_final = 0;
		var version_least = 0;
		RemoteConfig.getValue("version_final", function(value) {
			if(value != null) version_final = value;
			RemoteConfig.getValue("version_least", function(value) {
				if(value != null) version_least = value;

				if(version_least > config.appVersion) {
					appMethod.confirm("forceUpgrade", function(buttonIndex) {
						if(buttonIndex == 1) {	//開啟程式頁面
							window.open(config.downloadPage, '_system');
							appMethod.showLoading(config.message.forceBlock.title, config.message.forceBlock.content);
						}
						else navigator.app.exitApp();
					});
				}
				else if(version_final > config.appVersion) {
					appMethod.confirm("newVersion", function(buttonIndex) {
						if(buttonIndex == 1) {	//開啟程式頁面
							window.open(config.downloadPage, '_system');
						}
						appCheckFinish();
					});
				}
				else appCheckFinish();
			});
		});
    },
	getUserConfig: function() {  //取得個人設定
		if(!localStorage.userConfig) {  //個人設定不存在
			localStorage.userConfig = JSON.stringify(config.defaultUserConfig);
			appMethod.userConfig = config.defaultUserConfig;
			return config.defaultUserConfig;
		}
		else if(Object.keys(appMethod.userConfig).length != 0) return appMethod.userConfig;
		else {
			appMethod.userConfig = JSON.parse(localStorage.userConfig);
			return appMethod.userConfig;  //讀取個人設定
		}
	},
	setUserConfig: function(key, value) {	//設定個人設定
		var userConfig = appMethod.getUserConfig();
		userConfig[key] = value;
		localStorage.userConfig = JSON.stringify(userConfig);
		appMethod.userConfig = userConfig;
	},
	showAD: function(type) {
		var now = new Date();
		var adShowTime = new Date(sessionStorage.adShowTime);

		var ad_delay = config.defaultADdelay;
		adShowTime = new Date( adShowTime.getTime() + ad_delay * 60 * 1000);
		if(now > adShowTime) return true;
		return false;
	},
	alert: function(messageKey, callback, data) {
		var message = config.message[messageKey].content;
		if(data) {
			for(var key in data) {
				message = replaceAll(message, "["+key+"]", data[key]);
			}
		}
		if(config.onDebugMode) {
			alert(message);
			callback.call(callback);
		}
		else {
			navigator.notification.alert(
				message, // message
				callback,
				config.message[messageKey].title,   // title
				config.message[messageKey].btnLabel	// buttonLabels
			);
		}
	},
	confirm: function(messageKey, callback) {
		if(config.onDebugMode) {
			var buttonIndex = 2;
			var r = confirm(config.message[messageKey].content);
			if(r) buttonIndex = 1;
			callback.call(callback, buttonIndex);
		}
		else {
			navigator.notification.confirm(
				config.message[messageKey].content, // message
				callback,
				config.message[messageKey].title,   // title
				config.message[messageKey].btnLabel	// buttonLabels
			);
		}
	},
	toast: function(messageKey, callback, callerror) {
		if(config.onDebugMode) console.log("toast: "+messageKey);
		else {
			var duration = "short";
			var position = "center";
			var style = {};
			if(config.message[messageKey].duration) duration = config.message[messageKey].duration;
			if(config.message[messageKey].position) position = config.message[messageKey].position;
			if(config.message[messageKey].style) style = config.message[messageKey].style;

			window.plugins.toast.showWithOptions(
				{
					message: config.message[messageKey].content,
					duration: duration,
					position: position,
					styling: style
				},
				function(e) {
					if(callback) callback.call(callback, e);
				},
				function(e) {
					if(callerror) callerror.call(callerror, e);
				}
			);
		}
	},
	showLoading: function(title, message) {
		if($("#message").length == 0) {	//目前沒有loading視窗
			$("body").append("<div id=\"message\"><div class=\"messagebox\"></div></div>");
			$("#message .messagebox").append("<div class=\"message_icon\"></div>");
			$("#message .messagebox").append("<div class=\"message_text\"></div>");
			$("#message .message_text").append("<h5>"+title+"</h5>");
			$("#message .message_text").append("<p>"+message+"</p>");
		}
		else {
			$("#message .message_text").html("");
			$("#message .message_text").append("<h5>"+title+"</h5>");
			$("#message .message_text").append("<p>"+message+"</p>");
		}
		$("#message").show();
	},
	closeLoading: function() {
		if($("#message").length != 0) $("#message").hide();
	},
	openDatabase: function() {
		if(appMethod.db == null) {
			if(config.onDebugMode) appMethod.db = window.openDatabase("meMoke", "", "meMokeDB", 5 * 1024 * 1024);
			else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent))
				appMethod.db = window.sqlitePlugin.openDatabase({name: 'meMoke.db', iosDatabaseLocation: 'default'});
			else appMethod.db = window.sqlitePlugin.openDatabase({name: 'meMoke.db', location: 'default'});;
		}
	},
	initDBtable: function(callback, callerror) {
		appMethod.openDatabase();
		appMethod.db.transaction(function(tx) {
			for(let tablename in appMethod.dbTable) {	//檢查所有資料表
				tx.executeSql('SELECT sql FROM sqlite_master WHERE type=? AND name=?', ["table", tablename], function(tx, rs) {
					if (rs.rows.length == 1) {	//資料表已經存在
						//取得目前所有欄位
						var columnParts = rs.rows.item(0).sql.replace(/^[^\(]+\(([^\)]+)\)/g, '$1').replace(/\`/g, '').replace(/\ /g, '').split(',');
						var column_len = appMethod.dbTable[tablename].length;
						for(var i=0; i<column_len; i++) {	//檢查目標欄位是否存在
							var column_name = appMethod.dbTable[tablename][i];
							if(columnParts.indexOf(column_name) == -1) {	//目標欄位不存在
								var updateStr = "ALTER TABLE `"+tablename+"` ADD `"+column_name+"`";
								tx.executeSql(updateStr);
							}
						}
					}
					else {	//資料表不存在，建立資料表
						var createStr = "CREATE TABLE IF NOT EXISTS `"+tablename+"` (`"+appMethod.dbTable[tablename].join("`, `")+"`)";
						tx.executeSql(createStr);
					}
				}, function(tx, error) {
					if(callerror) callerror.call(callerror);
				});
			}
		}, function(error) {
			if(callerror) callerror.call(callerror, error);
		}, function() {
			if(callback) callback.call(callback);
		});
	},
	insertData: function(table, data, callback, callerror) {
		var column_name = Object.keys(data);	//取得要儲存的欄位名稱
		var column_value = [];					//取得要儲存的欄位值
		var values_input = [];					//SQL帶入參數使用
		var column_len = column_name.length;
		for(var i=0; i<column_len; i++) {
			column_value.push(data[column_name[i]]);
			values_input.push("?");
		}

		var insertStr = "INSERT INTO `"+table+"` (`"+column_name.join("`, `")+"`) VALUES ("+values_input.join(",")+")";
		appMethod.db.transaction(function(tx) {
			tx.executeSql(insertStr, column_value, function(tx, rs) {
				if(callback) callback.call(callback);
			}, function(tx, error) {
				if(callerror) callerror.call(callerror, error);
			});
		});
	},
	updateData: function(table, selector, data, callback, callerror) {
		var first = true;
		var updateStr = "UPDATE `"+table+"` SET ";
		var column_value = [];					//取得要儲存的欄位值
		for(var column_name in data) {
			if(first) first = false;
			else updateStr += ", ";
			updateStr += "`"+column_name+"` = ? ";
			column_value.push(data[column_name]);
		}
		
		updateStr += "WHERE ";
		first = true;
		for(var key in selector) {
			if(first) first = false;
			else updateStr += "AND ";
			updateStr += "`"+key+"` = ? ";
			column_value.push(selector[key]);
		}

		appMethod.db.transaction(function(tx) {
			tx.executeSql(updateStr, column_value, function(tx, rs) {
				if(callback) callback.call(callback);
			}, function(tx, error) {
				if(callerror) callerror.call(callerror, error);
			});
		});
	},
	closeDatabase: function() {
		if(appMethod.db != null) appMethod.db.close();
	},
	share: function(link, message, subject, image) {
		if(config.onDebugMode && link) window.open('http://www.facebook.com/share.php?u='+link, '_system');
		else window.plugins.socialsharing.share(message, subject, image, link);
		if(link) GoogleAnalytics.trackEvent("share", {content_type:"link", item_id: link});
	},
	formateDate: function(dateObj) {	//格式化日期物件
		var month = dateObj.getMonth() + 1;
		if(month < 10) month = "0" + month;
		var day =  dateObj.getDate();
		if(day < 10) day = "0" + day;
		var dateStr = dateObj.getFullYear() + "." + month + "." + day;
		return dateStr;
    },
	getShowDate: function() {
		var showDate = new Date();	//今日
		var userConfig = appMethod.getUserConfig();
		if(userConfig.lastViewClass == "date") {
			if(userConfig.lastViewFilter == "Yesterday") showDate.setDate( showDate.getDate() - 1 );		//昨日
			else if(userConfig.lastViewFilter == "Tomorrow") showDate.setDate( showDate.getDate() + 1 );	//明日
			else if(userConfig.lastViewFilter != "Today") showDate = new Date(userConfig.lastViewFilter);	//指定日期
			return appMethod.formateDate(showDate);
		}
		return null;
	},
	changeFontWeight: function(tagSelector) {
		if( $(tagSelector).css("font-weight") == "400") {
			$(tagSelector).css("font-weight", "bold");
			$(tagSelector).text("粗");
			appMethod.editor.bold = 1;
		}
		else {
			$(tagSelector).css("font-weight", "400");
			$(tagSelector).text("細");
			appMethod.editor.bold = 0;
		}
		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"changeFontWeight"});
	},
	resetEditor: function() {
		appMethod.editor = {};
		appMethod.editor.startDate = Date.now();
		appMethod.editor.bold = 0;
		appMethod.editor.color = "";
		appMethod.editor.background = "";
		appMethod.editor.tag = "";
		appMethod.editor.label = "";
	},
	openColorPicker: function(tagSelector, limit) {	//開啟顏色選擇器，指定設定的標籤及可選的數量
		appMethod.tempSelector = tagSelector;
		if(limit) appMethod.colorLimit = limit;
		else appMethod.colorLimit = 1;

		if($("#colorPicker").length == 0) {		//物件不存在，建立物件
			var $colorPicker = $("<div class=\"menuList\" id=\"colorPicker\"><ul class=\"menuOption\"></ul></div>");
			$colorPicker.find(".menuOption").append("<li class=\"tip\">請選擇顏色</li>");
			$colorPicker.find(".menuOption").append("<li>選取 (<span id=\"colorSelected\">0</span>/<span id=\"colorLimited\"></span>)<p id=\"colorPicked\"></p></li>");
			$colorPicker.find(".menuOption").append("<li><div id=\"palette\"></div></li>");
			$colorPicker.find(".menuOption").append("<li class=\"menu_bottom\"><button class=\"menu_left cancel\" onclick=\"appMethod.cp_cancel()\"><i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/000000/cancel.svg);\"></i>取消</button><button class=\"menu_right\" onclick=\"appMethod.cp_ok()\"><i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/000000/check_circle.svg);\"></i>確定</button></li>");
			$colorPicker.appendTo("body");

			$("#colorPicked").on("click", "span", function(e) {		//設定移除色票事件
				$(e.target).remove();
				$("#colorSelected").text( parseInt( $("#colorSelected").text() ) - 1);
				GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"removeColorPicker"});
			});
			$("#palette").kendoColorPalette({	//產生可選色票
				tileSize: {
					width: 35,
					height: 35
				},
				palette: [
					"#ffffff", "#000000", "#b4dcfa", "#212745", "#4e67c8", "#5eccf3", "#a7ea52", "#5dceaf", "#ff8021", "#f14124",
					"#f2f2f2", "#7f7f7f", "#8bc9f7", "#c7cce4", "#dbe0f4", "#def4fc", "#edfadc", "#def5ef", "#ffe5d2", "#fcd9d3",
					"#d8d8d8", "#595959", "#4facf3", "#909aca", "#b8c2e9", "#beeafa", "#dbf6b9", "#beebdf", "#ffcca6", "#f9b3a7",
					"#bfbfbf", "#3f3f3f", "#0d78c9", "#5967af", "#94a3de", "#9ee0f7", "#caf297", "#9de1cf", "#ffb279", "#f68d7b",
					"#a5a5a5", "#262626", "#063c64", "#181d33", "#31479f", "#11b2eb", "#81d319", "#34ac8b", "#d85c00", "#c3260c",
					"#7f7f7f", "#0c0c0c", "#021828", "#101322", "#202f6a", "#0b769c", "#568c11", "#22725c", "#903d00", "#821908"
				],
				change: appMethod.cp_select
			});
		}
		$("#colorLimited").text(appMethod.colorLimit);		//設定顏色可選上限

		var $sourceColor = $(appMethod.tempSelector).find("span").clone();
		if($sourceColor.length != 0) {
			$sourceColor.appendTo("#colorPicked");
			$("#colorSelected").text( $sourceColor.length );
		}
		$("#colorPicker").show();
		appMethod.logOpenMenu("#colorPicker", "appMethod.cp_cancel()");
		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"openColorPicker"});
	},
	cp_select: function(e) {	//選擇色票
		if( $("#colorPicked span").length < appMethod.colorLimit ) {
			$("#colorPicked").append("<span style=\"background-color:"+e.value+"\"></span>");
			$("#colorSelected").text( parseInt( $("#colorSelected").text() ) + 1);
		}
		else {
			$("#colorPicked span:last-child").remove();
			$("#colorPicked").append("<span style=\"background-color:"+e.value+"\"></span>");
		}
		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"selectColorPicker"});
	},
	cp_cancel: function() {		//取消顏色選擇器
		$("#colorPicker").hide();
		$("#colorPicked span").remove();	//移除所有色票
		$("#colorSelected").text( 0 );
		appMethod.logCloseMenu("#colorPicker");
		appMethod.tempSelector = null;
	},
	cp_ok: function() {		//設定已選擇的色票
		$(appMethod.tempSelector).html("");
		if($(appMethod.tempSelector).parent().attr("type"))
			appMethod.editor[$(appMethod.tempSelector).parent().attr("type")] = appMethod.getColorTicket( $("#colorPicked span") ).join(";");
		$("#colorPicked span").appendTo( $(appMethod.tempSelector) );	//移動色票
		appMethod.cp_cancel();
		if(appMethod.tempCallback) appMethod.tempCallback.call(appMethod.tempCallback);
		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"confirmColorPicker"});
	},
	openDatePicker: function(tagSelector, range) {		//開啟日期選擇器，是否有日期區間
		var oSDate = new Date();
		var oEDate = new Date();
		appMethod.tempSelector = tagSelector;
		if($(appMethod.tempSelector).html()) {	//原始日期存在
			var tagStr = $(appMethod.tempSelector).html();
			var dashed = tagStr.indexOf(" - ");
			if(dashed != -1) {	//有日期區間
				oSDate = new Date(tagStr.substring(0, dashed));
				oEDate = new Date(tagStr.substring(dashed+3, tagStr.length));
				range = true;
			}
			else {				//無日期區間
				oSDate = new Date(tagStr);
				oEDate = new Date(tagStr);
			}
		}

		if($("#datePicker").length == 0) {		//物件不存在，建立物件
			var $datePicker = $("<div class=\"menuList\" id=\"datePicker\"><ul class=\"menuOption\"></ul></div>");
			$datePicker.find(".menuOption").append("<li class=\"tip\">請選擇日期</li>");
			$datePicker.find(".menuOption").append("<li><i class=\"material-icons calendar\" style=\"background-image: url(library/GoogleMaterialIcons/000000/date_range.svg);\"></i>起始日期<p id=\"startDate\"></p><input id=\"startDatePicker\" class=\"datePicker\" /></li>");
			$datePicker.find(".menuOption").append("<li class=\"endDateLine\"><i class=\"material-icons calendar\" style=\"background-image: url(library/GoogleMaterialIcons/000000/date_range.svg);\"></i>結束日期<p id=\"endDate\"></p><input id=\"endDatePicker\" class=\"datePicker\" /></li>");
			$datePicker.find(".menuOption").append("<li class=\"menu_bottom\"><button class=\"menu_left cancel\" onclick=\"appMethod.dp_cancel()\"><i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/000000/cancel.svg);\"></i>取消</button><button class=\"menu_right\" onclick=\"appMethod.dp_ok()\"><i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/000000/check_circle.svg);\"></i>確定</button></li>");
			$datePicker.appendTo("body");

			$("#startDatePicker").kendoDatePicker({
				value: oSDate,
				open: function() {
					var calendar = this.dateView.calendar;
					calendar.wrapper.width(350);
					appMethod.logOpenMenu("#kendoDatePicker", "lock");
				},
				change: function() {
					var startDate = $("#startDatePicker").val();
					$("#startDate").text(startDate);
					var endDatePicker = $("#endDatePicker").data("kendoDatePicker");
					endDatePicker.min( new Date(startDate) );
					endDatePicker.value( new Date(startDate) );
					$("#endDate").text( startDate );
					appMethod.logCloseMenu("#kendoDatePicker");
					GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"selectDatePicker"});
				},
				depth: "month",
				format: "yyyy.MM.dd",
				footer: false
			}).addClass("datePicker");
			$("#endDatePicker").kendoDatePicker({
				value: oEDate,
				open: function() {
					var calendar = this.dateView.calendar;
					calendar.wrapper.width(350);
					appMethod.logOpenMenu("#kendoDatePicker", "lock");
				},
				change: function() {
					var endDate = $("#endDatePicker").val();
					$("#endDate").text(endDate);
					var startDatePicker = $("#startDatePicker").data("kendoDatePicker");
					startDatePicker.max( new Date(endDate) );
					appMethod.logCloseMenu("#kendoDatePicker");
					GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"selectDatePicker"});
				},
				format: "yyyy.MM.dd",
				footer: false
			}).addClass("datePicker");
			$(".datePicker").hide();

			$("#datePicker li").click(function(){
				if( $(this).find("i.calendar").length != 0) {
					var datepicker = $(this).find("input").data("kendoDatePicker");
					datepicker.open();
				}
			});
		}
		else {
			var startDatePicker = $("#startDatePicker").data("kendoDatePicker");
			startDatePicker.value(oSDate);
			startDatePicker.max(new Date(2099, 12, 31));
			var endDatePicker = $("#endDatePicker").data("kendoDatePicker");
			endDatePicker.value(oEDate);
			endDatePicker.min(new Date(1900, 1, 1));
		}
		$("#startDate").text( appMethod.formateDate(oSDate) );
		if(range) {
			$(".endDateLine").show();
			$("#endDate").text( appMethod.formateDate(oEDate) );
		}
		else $(".endDateLine").hide();

		$("#datePicker").show();
		appMethod.logOpenMenu("#datePicker", "appMethod.dp_cancel()");
		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"openDatePicker"});
	},
	dp_cancel: function() {
		$("#datePicker").hide();
		appMethod.logCloseMenu("#kendoDatePicker");
		appMethod.logCloseMenu("#datePicker");
		appMethod.tempSelector = null;
	},
	dp_ok: function() {
		var startDatePicker = $("#startDatePicker").val();
		var endDatePicker = $("#endDatePicker").val();
		appMethod.editor.startDate = new Date(startDatePicker).getTime();
		appMethod.editor.endDate = new Date(endDatePicker).getTime();

		if($(".endDateLine").css("display") == "none" || startDatePicker == endDatePicker) {
			$(appMethod.tempSelector).html(startDatePicker);
		}
		else {
			$(appMethod.tempSelector).html(startDatePicker + " - " + endDatePicker);
		}
		appMethod.dp_cancel();
		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"confirmDatePicker"});
	},
	openIconPicker: function(tagSelector) {
		appMethod.tempSelector = tagSelector;
		if($("#iconPicker").length == 0) {		//物件不存在，建立物件
			var $iconPicker = $("<div class=\"menuList\" id=\"iconPicker\"><ul class=\"menuOption\"></ul></div>");
			$iconPicker.find(".menuOption").append("<li class=\"iconColor\" onclick=\"appMethod.icp_color()\"><i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/000000/palette.svg);\"></i>圖示顏色<p></p></li>");
			$iconPicker.find(".menuOption").append("<li class=\"iconList\"></li>");
			$iconPicker.find(".menuOption").append("<li class=\"menu_bottom\"><button class=\"menu_left cancel\" onclick=\"appMethod.icp_cancel()\"><i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/000000/cancel.svg);\"></i>取消</button><button class=\"menu_right\" onclick=\"appMethod.icp_ok()\"><i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/000000/check_circle.svg);\"></i>確定</button></li>");
			$iconPicker.appendTo("body");
			$("#iconPicker .iconList").append("<i class=\"empty\" name=\"empty\"></i>");
			var icon_len = config.iconWord.length;
			for(var i=0; i<icon_len; i++) {
				//$("#iconPicker .iconList").append("<i class=\""+config.iconWord[i]+" icon\" name=\""+config.iconWord[i]+"\"></i>");
				$("#iconPicker .iconList").append("<i class=\"material-icons\" style=\"background-image: url(library/GoogleMaterialIcons/000000/"+config.iconWord[i]+".svg);\" name=\""+config.iconWord[i]+"\" color=\"000000\"></i>");
			}
			$("#iconPicker .iconList i").click(function() {
				appMethod.icp_selReset();
				var icon_color = appMethod.defaultIconColor;	//取得色票
				if( $("#iconPicker .iconColor p span").length != 0 ) {
					icon_color = appMethod.getColorDir( $("#iconPicker .iconColor p span").css("background-color") );
				}
				$(this).attr("selThis", "true");
				$(this).attr("color", icon_color);
				if($(this).hasClass("empty")) {
					$(this).css("border-color", "#"+icon_color);
				}
				else {
					var iconWord = $(this).attr("name");
					$(this).css("background-image", "url(library/GoogleMaterialIcons/"+icon_color+"/"+iconWord+".svg)");
				}
				GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"selectIconPicker"});
			});
		}
		if($(appMethod.tempSelector).html()) {	//開啟圖示選擇器時，載入原本的圖示設定
			var $orgObj = $(appMethod.tempSelector+" i");
			var orgColor = $orgObj.attr("color");
			var orgName = $orgObj.attr("name");
			var $iconPicked = $("#iconPicker .iconList i[name='"+orgName+"']");
			$("#iconPicker .iconColor p").html("<span style=\"background-color:#"+orgColor+"\"></span>");
			$iconPicked.css("background-image", "url(library/GoogleMaterialIcons/"+orgColor+"/"+orgName+".svg)");
			$iconPicked.attr("selThis", "true");
		}
		$("#iconPicker").show();
		appMethod.logOpenMenu("#iconPicker", "appMethod.icp_cancel()");
		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"openIconPicker"});
	},
	icp_color: function() {		//開啟色彩選擇器時，設定選擇顏色後的callback function
		var tagSelector = appMethod.tempSelector;	//儲存原本的選擇器
		appMethod.tempCallback = function() {
			var $select_icon = $("#iconPicker .iconList i[selThis='true']");
			var icon_color = appMethod.getColorDir( $("#iconPicker .iconColor p span").css("background-color") );
			$select_icon.attr("color", icon_color);	//設定色票上的顏色
			if($select_icon.hasClass("empty")) $select_icon.css("border-color", "#"+icon_color);	//設定自定顏色
			else {
				var iconWord = $select_icon.attr("name");
				$select_icon.css("background-image", "url(library/GoogleMaterialIcons/"+icon_color+"/"+iconWord+".svg)");
			}
			appMethod.tempCallback = null;
			appMethod.tempSelector = tagSelector;	//將選擇器設回
		}
		appMethod.openColorPicker('#iconPicker .iconColor p');
	},
	icp_selReset: function() {	//重設選取的色票顏色
		var oldObj = $("#iconPicker .iconList i[selThis=true]");	//找出之前選擇的項目
		if(oldObj.length > 0) {
			var iconWord = oldObj.attr("name");
			oldObj.css("background-image", "url(library/GoogleMaterialIcons/000000/"+iconWord+".svg)");
			oldObj.attr("selThis", "false");		//清除選取
		}
		$("#iconPicker .iconList i.empty").css("border-color", "inherit");
	},
	icp_cancel: function() {
		$("#iconPicker").hide();
		appMethod.logCloseMenu("#iconPicker");
		appMethod.tempSelector = null;
		appMethod.icp_selReset();
	},
	icp_ok: function() {
		var $select_icon = $("#iconPicker .iconList i[selThis='true']");
		if($select_icon.hasClass("empty")) {
			$(appMethod.tempSelector).html("");
			appMethod.editor.label = "";
		}
		else {
			$(appMethod.tempSelector).html( $select_icon.clone()[0] );	//直接設定給目標
			appMethod.editor.label =  $select_icon.attr("name") + ";" + $select_icon.attr("color");
		}
		appMethod.icp_cancel();
		GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"confirmIconPicker"});
	},
	getColorTicket: function(spanObjs) {	//從色票中取得顏色
		var colors = [];
		var len = spanObjs.length;
		if(len == 0) return [""];
		for(var i=0; i<len; i++) {
			colors.push( rgbToHex($(spanObjs[i]).css("background-color")) );
		}
		return colors;
	},
	getColorDir: function(color) {
		var hexColor = rgbToHex(color).toUpperCase();
		if(hexColor.indexOf("008000") != -1) return appMethod.defaultIconColor;		//舊版預設顏色不存在
		return hexColor.indexOf("#") == -1 ? hexColor : hexColor.split('#')[1];
	},
	logMenuClear: function() {
		appMethod.menuOpenLogs = [];
	},
	logOpenMenu: function(selector, closeFunc) {
		var addLog = {};
		addLog.selector = selector;
		if(closeFunc) addLog.closeFunc = closeFunc;
		appMethod.menuOpenLogs.push(addLog);
	},
	logCloseMenu: function(selector) {
		var removeLog = appMethod.menuOpenLogs.pop();
		if(removeLog.selector != selector) {
			var index = array_column(appMethod.menuOpenLogs, "selector").indexOf(selector);
			if(index != -1) appMethod.menuOpenLogs.splice(index, 1);
			appMethod.menuOpenLogs.push(removeLog);
		}
	},
	introduction: function() {
		var $introduction = $("<div id=\"introduction\"></div>");
		if(appMethod.introCount) $introduction.css("background-image", "url(images/introduction_1.png)");

		var $point = $("<div class=\"point\"></div>");
		for(var i=0;i<appMethod.introCount;i++) {
			$point.append("<span>○</span>");
		}
		$point.find("span").eq(0).addClass("active").text("●");
		$introduction.append($point);
		$introduction.appendTo("body");
		$introduction.on("swipeleft", function(e, touch) {
			var nextIndex = $(".point span.active").index() + 1;
			if(nextIndex >= appMethod.introCount) $introduction.remove();
			else {
				$point.find("span").removeClass("active").text("○");
				$point.find("span").eq(nextIndex).addClass("active").text("●");
				$introduction.css("background-image", "url(images/introduction_"+(nextIndex+1)+".png)");
			}
		});
		$introduction.on("swiperight", function(e, touch) {
			var preIndex = $(".point span.active").index() - 1;
			if(preIndex < 0) $introduction.remove();
			else {
				$point.find("span").removeClass("active").text("○");
				$point.find("span").eq(preIndex).addClass("active").text("●");
				$introduction.css("background-image", "url(images/introduction_"+(preIndex+1)+".png)");
			}
		});
		// GoogleAnalytics.trackEvent("select_content", {content_type:"buttonClick", item_id:"openIntroduction"});
	}
};

function htmlEncode(str) {
	var obj = $("<div></div>");
	obj.html(str);
	return obj.text();
}
function array_column(array, col) {		//取出陣列中的指定欄位
	var target = [];
	array.forEach(function (item) {
		target.push(item[col]);
	});
	return target;
}
function ksort(JSONobj) {	//按照JSON key排列
	var target = {};
	var keys = Object.keys(JSONobj);
	keys.sort();
	keys.forEach(function (key) {
		target[key] = JSONobj[key];
	});
	return target;
}
function sortColumn(array, col) {	//按照指定欄位排列
	array.sort(function (a, b) {
		if(a[col] > b[col])	return 1;
		if(a[col] < b[col])	return -1;
		return 0;
	});
	return array;
}
function objSort(obj) {		//按照JSON value排列，注意回傳變array
	var array = [];
	for(var key in obj){
		array.push([key, obj[key]]);
	}
	sortColumn(array, 1);
	return array;
}
function rgbToHex(rgb) {
	function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}
	if(rgb.indexOf("rgb") != -1) {
		var first_comma = rgb.indexOf(",");
		var secend_comma = rgb.lastIndexOf(",");
		var r = parseInt( rgb.substring(rgb.indexOf("(")+1, first_comma) );
		var g = parseInt( rgb.substring(first_comma+2, secend_comma) );
		var b = parseInt( rgb.substring(secend_comma+2, rgb.indexOf(")")) );
		return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	}
	return rgb;
}
function replaceAll(string, find, replace) {
	function escapeRegExp(string) {
		return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	}
	return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
var getRequest = function() {
	var obj = {};
	var uri = location.search;
	if(uri) {
		var name = uri.replace('?', '').split("&");
		for (var i = 0; i < name.length; i++) {
			obj[name[i].split('=')[0]] = name[i].split('=')[1] || '';
		}
		return obj;
	}
	return null;
};
