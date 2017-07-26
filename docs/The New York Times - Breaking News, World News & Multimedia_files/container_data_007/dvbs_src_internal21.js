function dv_rolloutManager(handlersDefsArray, baseHandler) {
    this.handle = function () {
        var errorsArr = [];

        var handler = chooseEvaluationHandler(handlersDefsArray);
        if (handler) {
            var errorObj = handleSpecificHandler(handler);
            if (errorObj === null) {
                return errorsArr;
            }
            else {
                var debugInfo = handler.onFailure();
                if (debugInfo) {
                    for (var key in debugInfo) {
                        if (debugInfo.hasOwnProperty(key)) {
                            if (debugInfo[key] !== undefined || debugInfo[key] !== null) {
                                errorObj[key] = encodeURIComponent(debugInfo[key]);
                            }
                        }
                    }
                }
                errorsArr.push(errorObj);
            }
        }

        var errorObjHandler = handleSpecificHandler(baseHandler);
        if (errorObjHandler) {
            errorObjHandler['dvp_isLostImp'] = 1;
            errorsArr.push(errorObjHandler);
        }
        return errorsArr;
    };

    function handleSpecificHandler(handler) {
        var request;
        var errorObj = null;

        try {
            request = handler.createRequest();
            if (request && !request.isSev1) {
                var url = request.url || request;
                if (url) {
                    if (!handler.sendRequest(url)) {
                        errorObj = createAndGetError('sendRequest failed.',
                            url,
                            handler.getVersion(),
                            handler.getVersionParamName(),
                            handler.dv_script);
                    }
                } else {
                    errorObj = createAndGetError('createRequest failed.',
                        url,
                        handler.getVersion(),
                        handler.getVersionParamName(),
                        handler.dv_script,
                        handler.dvScripts,
                        handler.dvStep,
                        handler.dvOther
                    );
                }
            }
        }
        catch (e) {
            errorObj = createAndGetError(e.name + ': ' + e.message, request ? (request.url || request) : null, handler.getVersion(), handler.getVersionParamName(), (handler ? handler.dv_script : null));
        }

        return errorObj;
    }

    function createAndGetError(error, url, ver, versionParamName, dv_script, dvScripts, dvStep, dvOther) {
        var errorObj = {};
        errorObj[versionParamName] = ver;
        errorObj['dvp_jsErrMsg'] = encodeURIComponent(error);
        if (dv_script && dv_script.parentElement && dv_script.parentElement.tagName && dv_script.parentElement.tagName == 'HEAD') {
            errorObj['dvp_isOnHead'] = '1';
        }
        if (url) {
            errorObj['dvp_jsErrUrl'] = url;
        }
        if (dvScripts) {
            var dvScriptsResult = '';
            for (var id in dvScripts) {
                if (dvScripts[id] && dvScripts[id].src) {
                    dvScriptsResult += encodeURIComponent(dvScripts[id].src) + ":" + dvScripts[id].isContain + ",";
                }
            }
            
            
            
        }
        return errorObj;
    }

    function chooseEvaluationHandler(handlersArray) {
        var config = window._dv_win.dv_config;
        var index = 0;
        var isEvaluationVersionChosen = false;
        if (config.handlerVersionSpecific) {
            for (var i = 0; i < handlersArray.length; i++) {
                if (handlersArray[i].handler.getVersion() == config.handlerVersionSpecific) {
                    isEvaluationVersionChosen = true;
                    index = i;
                    break;
                }
            }
        }
        else if (config.handlerVersionByTimeIntervalMinutes) {
            var date = config.handlerVersionByTimeInputDate || new Date();
            var hour = date.getUTCHours();
            var minutes = date.getUTCMinutes();
            index = Math.floor(((hour * 60) + minutes) / config.handlerVersionByTimeIntervalMinutes) % (handlersArray.length + 1);
            if (index != handlersArray.length) { 
                isEvaluationVersionChosen = true;
            }
        }
        else {
            var rand = config.handlerVersionRandom || (Math.random() * 100);
            for (var i = 0; i < handlersArray.length; i++) {
                if (rand >= handlersArray[i].minRate && rand < handlersArray[i].maxRate) {
                    isEvaluationVersionChosen = true;
                    index = i;
                    break;
                }
            }
        }

        if (isEvaluationVersionChosen == true && handlersArray[index].handler.isApplicable()) {
            return handlersArray[index].handler;
        }
        else {
            return null;
        }
    }
}

function doesBrowserSupportHTML5Push() {
    "use strict";
    return typeof window.parent.postMessage === 'function' && window.JSON;
}

function dv_GetParam(url, name, checkFromStart) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = (checkFromStart ? "(?:\\?|&|^)" : "[\\?&]") + name + "=([^&#]*)";
    var regex = new RegExp(regexS, 'i');
    var results = regex.exec(url);
    if (results == null)
        return null;
    else
        return results[1];
}

function dv_Contains(array, obj) {
    var i = array.length;
    while (i--) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}

function dv_GetDynamicParams(url) {
    try {
        var regex = new RegExp("[\\?&](dvp_[^&]*=[^&#]*)", "gi");
        var dvParams = regex.exec(url);

        var results = new Array();
        while (dvParams != null) {
            results.push(dvParams[1]);
            dvParams = regex.exec(url);
        }
        return results;
    }
    catch (e) {
        return [];
    }
}

function dv_createIframe() {
    var iframe;
    if (document.createElement && (iframe = document.createElement('iframe'))) {
        iframe.name = iframe.id = 'iframe_' + Math.floor((Math.random() + "") * 1000000000000);
        iframe.width = 0;
        iframe.height = 0;
        iframe.style.display = 'none';
        iframe.src = 'about:blank';
    }

    return iframe;
}

function dv_GetRnd() {
    return ((new Date()).getTime() + "" + Math.floor(Math.random() * 1000000)).substr(0, 16);
}

function dv_SendErrorImp(serverUrl, errorsArr) {

    for (var j = 0; j < errorsArr.length; j++) {
        var errorObj = errorsArr[j];
        var errorImp = dv_CreateAndGetErrorImp(serverUrl, errorObj);
        dv_sendImgImp(errorImp);
    }
}

function dv_CreateAndGetErrorImp(serverUrl, errorObj) {
    var errorQueryString = '';
    for (key in errorObj) {
        if (errorObj.hasOwnProperty(key)) {
            if (key.indexOf('dvp_jsErrUrl') == -1) {
                errorQueryString += '&' + key + '=' + errorObj[key];
            }
            else {
                var params = ['ctx', 'cmp', 'plc', 'sid'];
                for (var i = 0; i < params.length; i++) {
                    var pvalue = dv_GetParam(errorObj[key], params[i]);
                    if (pvalue) {
                        errorQueryString += '&dvp_js' + params[i] + '=' + pvalue;
                    }
                }
            }
        }
    }

    var windowProtocol = 'https:';
    var sslFlag = '&ssl=1';

    var errorImp = windowProtocol + '//' + serverUrl + sslFlag + errorQueryString;
    return errorImp;
}

function dv_sendImgImp(url) {
    (new Image()).src = url;
}

function dv_sendScriptRequest(url) {
    document.write('<scr' + 'ipt type="text/javascript" src="' + url + '"></scr' + 'ipt>');
}

function dv_getPropSafe(obj, propName) {
    try {
        if (obj)
            return obj[propName];
    } catch (e) {
    }
}

function dvBsType() {
    var that = this;
    var eventsForDispatch = {};
    this.t2tEventDataZombie = {};

    this.processT2TEvent = function (data, tag) {
        try {
            if (tag.ServerPublicDns) {
                data.timeStampCollection.push({"beginProcessT2TEvent": getCurrentTime()});
                data.timeStampCollection.push({'beginVisitCallback': tag.beginVisitCallbackTS});
                var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;

                if (!tag.uniquePageViewId) {
                    tag.uniquePageViewId = data.uniquePageViewId;
                }

                tpsServerUrl += '&dvp_upvid=' + tag.uniquePageViewId;
                tpsServerUrl += '&dvp_numFrames=' + data.totalIframeCount;
                tpsServerUrl += '&dvp_numt2t=' + data.totalT2TiframeCount;
                tpsServerUrl += '&dvp_frameScanDuration=' + data.scanAllFramesDuration;
                tpsServerUrl += '&dvp_scene=' + tag.adServingScenario;
                tpsServerUrl += '&dvp_ist2twin=' + (data.isWinner ? '1' : '0');
                tpsServerUrl += '&dvp_numTags=' + Object.keys($dvbs.tags).length;
                tpsServerUrl += '&dvp_isInSample=' + data.isInSample;
                tpsServerUrl += (data.wasZombie) ? '&dvp_wasZombie=1' : '&dvp_wasZombie=0';
                tpsServerUrl += '&dvp_ts_t2tCreatedOn=' + data.creationTime;
                if (data.timeStampCollection) {
                    if (window._dv_win.t2tTimestampData) {
                        for (var tsI = 0; tsI < window._dv_win.t2tTimestampData.length; tsI++) {
                            data.timeStampCollection.push(window._dv_win.t2tTimestampData[tsI]);
                        }
                    }

                    for (var i = 0; i < data.timeStampCollection.length; i++) {
                        var item = data.timeStampCollection[i];
                        for (var propName in item) {
                            if (item.hasOwnProperty(propName)) {
                                tpsServerUrl += '&dvp_ts_' + propName + '=' + item[propName];
                            }
                        }
                    }
                }
                $dvbs.domUtilities.addImage(tpsServerUrl, tag.tagElement.parentElement);
            }
        } catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&jsver=0&dvp_ist2tProcess=1', {dvp_jsErrMsg: encodeURIComponent(e)});
            } catch (ex) {
            }
        }
    };

    this.processTagToTagCollision = function (collision, tag) {
        var i;
        var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;
        var additions = [
            '&dvp_collisionReasons=' + collision.reasonBitFlag,
            '&dvp_ts_reporterDvTagCreated=' + collision.thisTag.dvTagCreatedTS,
            '&dvp_ts_reporterVisitJSMessagePosted=' + collision.thisTag.visitJSPostMessageTS,
            '&dvp_ts_reporterReceivedByT2T=' + collision.thisTag.receivedByT2TTS,
            '&dvp_ts_collisionPostedFromT2T=' + collision.postedFromT2TTS,
            '&dvp_ts_collisionReceivedByCommon=' + collision.commonRecievedTS,
            '&dvp_collisionTypeId=' + collision.allReasonsForTagBitFlag
        ];
        tpsServerUrl += additions.join("");

        for (i = 0; i < collision.reasons.length; i++) {
            var reason = collision.reasons[i];
            tpsServerUrl += '&dvp_' + reason + "MS=" + collision[reason + "MS"];
        }

        if (tag.uniquePageViewId) {
            tpsServerUrl += '&dvp_upvid=' + tag.uniquePageViewId;
        }
        $dvbs.domUtilities.addImage(tpsServerUrl, tag.tagElement.parentElement);
    };

    var messageEventListener = function (event) {
        try {
            var timeCalled = getCurrentTime();
            var data = window.JSON.parse(event.data);
            if (!data.action) {
                data = window.JSON.parse(data);
            }
            if (data.timeStampCollection) {
                data.timeStampCollection.push({messageEventListenerCalled: timeCalled});
            }
            var myUID;
            var visitJSHasBeenCalledForThisTag = false;
            if ($dvbs.tags) {
                for (var uid in $dvbs.tags) {
                    if ($dvbs.tags.hasOwnProperty(uid) && $dvbs.tags[uid] && $dvbs.tags[uid].t2tIframeId === data.iFrameId) {
                        myUID = uid;
                        visitJSHasBeenCalledForThisTag = true;
                        break;
                    }
                }
            }

            switch (data.action) {
                case 'uniquePageViewIdDetermination' :
                    if (visitJSHasBeenCalledForThisTag) {
                        $dvbs.processT2TEvent(data, $dvbs.tags[myUID]);
                        $dvbs.t2tEventDataZombie[data.iFrameId] = undefined;
                    }
                    else {
                        data.wasZombie = 1;
                        $dvbs.t2tEventDataZombie[data.iFrameId] = data;
                    }
                    break;
                case 'maColl':
                    var tag = $dvbs.tags[myUID];
                    
                    tag.AdCollisionMessageRecieved = true;
                    if (!tag.uniquePageViewId) {
                        tag.uniquePageViewId = data.uniquePageViewId;
                    }
                    data.collision.commonRecievedTS = timeCalled;
                    $dvbs.processTagToTagCollision(data.collision, tag);
                    break;
            }

        } catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&jsver=0&dvp_ist2tListener=1', {dvp_jsErrMsg: encodeURIComponent(e)});
            } catch (ex) {
            }
        }
    };

    if (window.addEventListener)
        addEventListener("message", messageEventListener, false);
    else
        attachEvent("onmessage", messageEventListener);

    this.pubSub = new function () {

        var subscribers = [];

        this.subscribe = function (eventName, uid, actionName, func) {
            if (!subscribers[eventName + uid])
                subscribers[eventName + uid] = [];
            subscribers[eventName + uid].push({Func: func, ActionName: actionName});
        };

        this.publish = function (eventName, uid) {
            var actionsResults = [];
            if (eventName && uid && subscribers[eventName + uid] instanceof Array)
                for (var i = 0; i < subscribers[eventName + uid].length; i++) {
                    var funcObject = subscribers[eventName + uid][i];
                    if (funcObject && funcObject.Func && typeof funcObject.Func == "function" && funcObject.ActionName) {
                        var isSucceeded = runSafely(function () {
                            return funcObject.Func(uid);
                        });
                        actionsResults.push(encodeURIComponent(funcObject.ActionName) + '=' + (isSucceeded ? '1' : '0'));
                    }
                }
            return actionsResults.join('&');
        };
    };

    this.domUtilities = new function () {

        this.addImage = function (url, parentElement) {
            var image = parentElement.ownerDocument.createElement("img");
            image.width = 0;
            image.height = 0;
            image.style.display = 'none';
            image.src = appendCacheBuster(url);
            parentElement.insertBefore(image, parentElement.firstChild);
        };

        this.addScriptResource = function (url, parentElement) {
            if (parentElement) {
                var scriptElem = parentElement.ownerDocument.createElement("script");
                scriptElem.type = 'text/javascript';
                scriptElem.src = appendCacheBuster(url);
                parentElement.insertBefore(scriptElem, parentElement.firstChild);
            }
            else {
                addScriptResourceFallBack(url);
            }
        };

        function addScriptResourceFallBack(url) {
            var scriptElem = document.createElement('script');
            scriptElem.type = "text/javascript";
            scriptElem.src = appendCacheBuster(url);
            var firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(scriptElem, firstScript);
        }

        this.addScriptCode = function (srcCode, parentElement) {
            var scriptElem = parentElement.ownerDocument.createElement("script");
            scriptElem.type = 'text/javascript';
            scriptElem.innerHTML = srcCode;
            parentElement.insertBefore(scriptElem, parentElement.firstChild);
        };

        this.addHtml = function (srcHtml, parentElement) {
            var divElem = parentElement.ownerDocument.createElement("div");
            divElem.style = "display: inline";
            divElem.innerHTML = srcHtml;
            parentElement.insertBefore(divElem, parentElement.firstChild);
        };
    };

    this.resolveMacros = function (str, tag) {
        var viewabilityData = tag.getViewabilityData();
        var viewabilityBuckets = viewabilityData && viewabilityData.buckets ? viewabilityData.buckets : {};
        var upperCaseObj = objectsToUpperCase(tag, viewabilityData, viewabilityBuckets);
        var newStr = str.replace('[DV_PROTOCOL]', upperCaseObj.DV_PROTOCOL);
        newStr = newStr.replace('[PROTOCOL]', upperCaseObj.PROTOCOL);
        newStr = newStr.replace(/\[(.*?)\]/g, function (match, p1) {
            var value = upperCaseObj[p1];
            if (value === undefined || value === null)
                value = '[' + p1 + ']';
            return encodeURIComponent(value);
        });
        return newStr;
    };

    this.settings = new function () {
    };

    this.tagsType = function () {
    };

    this.tagsPrototype = function () {
        this.add = function (tagKey, obj) {
            if (!that.tags[tagKey])
                that.tags[tagKey] = new that.tag();
            for (var key in obj)
                that.tags[tagKey][key] = obj[key];
        };
    };

    this.tagsType.prototype = new this.tagsPrototype();
    this.tagsType.prototype.constructor = this.tags;
    this.tags = new this.tagsType();

    this.tag = function () {
    };
    this.tagPrototype = function () {
        this.set = function (obj) {
            for (var key in obj)
                this[key] = obj[key];
        };

        this.getViewabilityData = function () {
        };
    };

    this.tag.prototype = new this.tagPrototype();
    this.tag.prototype.constructor = this.tag;

    this.getTagObjectByService = function (serviceName) {

        for (var impressionId in this.tags) {
            if (typeof this.tags[impressionId] === 'object'
                && this.tags[impressionId].services
                && this.tags[impressionId].services[serviceName]
                && !this.tags[impressionId].services[serviceName].isProcessed) {
                this.tags[impressionId].services[serviceName].isProcessed = true;
                return this.tags[impressionId];
            }
        }


        return null;
    };

    this.addService = function (impressionId, serviceName, paramsObject) {

        if (!impressionId || !serviceName)
            return;

        if (!this.tags[impressionId])
            return;
        else {
            if (!this.tags[impressionId].services)
                this.tags[impressionId].services = {};

            this.tags[impressionId].services[serviceName] = {
                params: paramsObject,
                isProcessed: false
            };
        }
    };

    this.Enums = {
        BrowserId: {Others: 0, IE: 1, Firefox: 2, Chrome: 3, Opera: 4, Safari: 5},
        TrafficScenario: {OnPage: 1, SameDomain: 2, CrossDomain: 128}
    };

    this.CommonData = {};

    var runSafely = function (action) {
        try {
            var ret = action();
            return ret !== undefined ? ret : true;
        } catch (e) {
            return false;
        }
    };

    var objectsToUpperCase = function () {
        var upperCaseObj = {};
        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    upperCaseObj[key.toUpperCase()] = obj[key];
                }
            }
        }
        return upperCaseObj;
    };

    var appendCacheBuster = function (url) {
        if (url !== undefined && url !== null && url.match("^http") == "http") {
            if (url.indexOf('?') !== -1) {
                if (url.slice(-1) == '&')
                    url += 'cbust=' + dv_GetRnd();
                else
                    url += '&cbust=' + dv_GetRnd();
            }
            else
                url += '?cbust=' + dv_GetRnd();
        }
        return url;
    };

    
    var messagesClass = function () {
        var waitingMessages = [];

        this.registerMsg = function(dvFrame, data) {
            if (!waitingMessages[dvFrame.$frmId]) {
                waitingMessages[dvFrame.$frmId] = [];
            }

            waitingMessages[dvFrame.$frmId].push(data);

            if (dvFrame.$uid) {
                sendWaitingEventsForFrame(dvFrame, dvFrame.$uid);
            }
        };

        this.startSendingEvents = function(dvFrame, impID) {
            sendWaitingEventsForFrame(dvFrame, impID);
            
        };

        function sendWaitingEventsForFrame(dvFrame, impID) {
            if (waitingMessages[dvFrame.$frmId]) {
                var eventObject = {};
                for (var i = 0; i < waitingMessages[dvFrame.$frmId].length; i++) {
                    var obj = waitingMessages[dvFrame.$frmId].pop();
                    for (var key in obj) {
                        if (typeof obj[key] !== 'function' && obj.hasOwnProperty(key)) {
                            eventObject[key] = obj[key];
                        }
                    }
                }
                that.registerEventCall(impID, eventObject);
            }
        }

        function startMessageManager() {
            for (var frm in waitingMessages) {
                if (frm && frm.$uid) {
                    sendWaitingEventsForFrame(frm, frm.$uid);
                }
            }
            setTimeout(startMessageManager, 10);
        }
    };
    this.messages = new messagesClass();

    this.dispatchRegisteredEventsFromAllTags = function () {
        for (var impressionId in this.tags) {
            if (typeof this.tags[impressionId] !== 'function' && typeof this.tags[impressionId] !== 'undefined')
                dispatchEventCalls(impressionId, this);
        }
    };

    var dispatchEventCalls = function (impressionId, dvObj) {
        var tag = dvObj.tags[impressionId];
        var eventObj = eventsForDispatch[impressionId];
        if (typeof eventObj !== 'undefined' && eventObj != null) {
            var url = tag.protocol + '//' + tag.ServerPublicDns + "/bsevent.gif?impid=" + impressionId + '&' + createQueryStringParams(eventObj);
            dvObj.domUtilities.addImage(url, tag.tagElement.parentElement);
            eventsForDispatch[impressionId] = null;
        }
    };

    this.registerEventCall = function (impressionId, eventObject, timeoutMs) {
        addEventCallForDispatch(impressionId, eventObject);

        if (typeof timeoutMs === 'undefined' || timeoutMs == 0 || isNaN(timeoutMs))
            dispatchEventCallsNow(this, impressionId, eventObject);
        else {
            if (timeoutMs > 2000)
                timeoutMs = 2000;

            var dvObj = this;
            setTimeout(function () {
                dispatchEventCalls(impressionId, dvObj);
            }, timeoutMs);
        }
    };

    var dispatchEventCallsNow = function (dvObj, impressionId, eventObject) {
        addEventCallForDispatch(impressionId, eventObject);
        dispatchEventCalls(impressionId, dvObj);
    };

    var addEventCallForDispatch = function (impressionId, eventObject) {
        for (var key in eventObject) {
            if (typeof eventObject[key] !== 'function' && eventObject.hasOwnProperty(key)) {
                if (!eventsForDispatch[impressionId])
                    eventsForDispatch[impressionId] = {};
                eventsForDispatch[impressionId][key] = eventObject[key];
            }
        }
    };

    if (window.addEventListener) {
        window.addEventListener('unload', function () {
            that.dispatchRegisteredEventsFromAllTags();
        }, false);
        window.addEventListener('beforeunload', function () {
            that.dispatchRegisteredEventsFromAllTags();
        }, false);
    }
    else if (window.attachEvent) {
        window.attachEvent('onunload', function () {
            that.dispatchRegisteredEventsFromAllTags();
        }, false);
        window.attachEvent('onbeforeunload', function () {
            that.dispatchRegisteredEventsFromAllTags();
        }, false);
    }
    else {
        window.document.body.onunload = function () {
            that.dispatchRegisteredEventsFromAllTags();
        };
        window.document.body.onbeforeunload = function () {
            that.dispatchRegisteredEventsFromAllTags();
        };
    }

    var createQueryStringParams = function (values) {
        var params = '';
        for (var key in values) {
            if (typeof values[key] !== 'function') {
                var value = encodeURIComponent(values[key]);
                if (params === '')
                    params += key + '=' + value;
                else
                    params += '&' + key + '=' + value;
            }
        }

        return params;
    };
}

function dv_handler76(){function H(c,a){var e=document.createElement("iframe");e.name=window._dv_win.dv_config.emptyIframeID||"iframe_"+I();e.width=0;e.height=0;e.id=a;e.style.display="none";e.src=c;return e}function J(c,a,e){var e=e||150,d=window._dv_win||window;if(d.document&&d.document.body)return a&&a.parentNode?a.parentNode.insertBefore(c,a):d.document.body.insertBefore(c,d.document.body.firstChild),!0;if(0<e)setTimeout(function(){J(c,a,--e)},20);else return!1}function K(c){var a=null;try{if(a=
c&&c.contentDocument)return a}catch(e){}try{if(a=c.contentWindow&&c.contentWindow.document)return a}catch(d){}try{if(a=window._dv_win.frames&&window._dv_win.frames[c.name]&&window._dv_win.frames[c.name].document)return a}catch(b){}return null}function L(c,a,e,d,b,k,v,j,t,r){var g,i,f;void 0==a.dvregion&&(a.dvregion=0);var h,l,n;try{f=d;for(i=0;10>i&&f!=window._dv_win.top;)i++,f=f.parent;d.depth=i;g=N(d);h="&aUrl="+encodeURIComponent(g.url);l="&aUrlD="+g.depth;n=d.depth+b;k&&d.depth--}catch(I){l=h=
n=d.depth=""}void 0!=a.aUrl&&(h="&aUrl="+a.aUrl);b=a.script.src;k="&ctx="+(dv_GetParam(b,"ctx")||"")+"&cmp="+(dv_GetParam(b,"cmp")||"")+"&plc="+(dv_GetParam(b,"plc")||"")+"&sid="+(dv_GetParam(b,"sid")||"")+"&advid="+(dv_GetParam(b,"advid")||"")+"&adsrv="+(dv_GetParam(b,"adsrv")||"")+"&unit="+(dv_GetParam(b,"unit")||"")+"&isdvvid="+(dv_GetParam(b,"isdvvid")||"")+"&uid="+a.uid+"&tagtype="+(dv_GetParam(b,"tagtype")||"")+"&adID="+(dv_GetParam(b,"adID")||"")+"&app="+(dv_GetParam(b,"app")||"")+"&sup="+
(dv_GetParam(b,"sup")||"");(f=dv_GetParam(b,"xff"))&&(k+="&xff="+f);(f=dv_GetParam(b,"useragent"))&&(k+="&useragent="+f);if(void 0!=window._dv_win.$dvbs.CommonData.BrowserId&&void 0!=window._dv_win.$dvbs.CommonData.BrowserVersion&&void 0!=window._dv_win.$dvbs.CommonData.BrowserIdFromUserAgent)g=window._dv_win.$dvbs.CommonData.BrowserId,i=window._dv_win.$dvbs.CommonData.BrowserVersion,f=window._dv_win.$dvbs.CommonData.BrowserIdFromUserAgent;else{var u=f?decodeURIComponent(f):navigator.userAgent;g=
[{id:4,brRegex:"OPR|Opera",verRegex:"(OPR/|Version/)"},{id:1,brRegex:"MSIE|Trident/7.*rv:11|rv:11.*Trident/7|Edge/",verRegex:"(MSIE |rv:| Edge/)"},{id:2,brRegex:"Firefox",verRegex:"Firefox/"},{id:0,brRegex:"Mozilla.*Android.*AppleWebKit(?!.*Chrome.*)|Linux.*Android.*AppleWebKit.* Version/.*Chrome",verRegex:null},{id:0,brRegex:"AOL/.*AOLBuild/|AOLBuild/.*AOL/|Puffin|Maxthon|Valve|Silk|PLAYSTATION|PlayStation|Nintendo|wOSBrowser",verRegex:null},{id:3,brRegex:"Chrome",verRegex:"Chrome/"},{id:5,brRegex:"Safari|(OS |OS X )[0-9].*AppleWebKit",
verRegex:"Version/"}];f=0;i="";for(var s=0;s<g.length;s++)if(null!=u.match(RegExp(g[s].brRegex))){f=g[s].id;if(null==g[s].verRegex)break;u=u.match(RegExp(g[s].verRegex+"[0-9]*"));null!=u&&(i=u[0].match(RegExp(g[s].verRegex)),i=u[0].replace(i[0],""));break}g=s=O();i=s===f?i:"";window._dv_win.$dvbs.CommonData.BrowserId=g;window._dv_win.$dvbs.CommonData.BrowserVersion=i;window._dv_win.$dvbs.CommonData.BrowserIdFromUserAgent=f}k+="&brid="+g+"&brver="+i+"&bridua="+f;(f=dv_GetParam(b,"turl"))&&(k+="&turl="+
f);(f=dv_GetParam(b,"tagformat"))&&(k+="&tagformat="+f);f="";try{var p=window._dv_win.parent;f+="&chro="+(void 0===p.chrome?"0":"1");f+="&hist="+(p.history?p.history.length:"");f+="&winh="+p.innerHeight;f+="&winw="+p.innerWidth;f+="&wouh="+p.outerHeight;f+="&wouw="+p.outerWidth;p.screen&&(f+="&scah="+p.screen.availHeight,f+="&scaw="+p.screen.availWidth)}catch(J){}var k=k+f,A;p=function(){try{return!!window.sessionStorage}catch(a){return!0}};f=function(){try{return!!window.localStorage}catch(a){return!0}};
i=function(){var a=document.createElement("canvas");if(a.getContext&&a.getContext("2d")){var b=a.getContext("2d");b.textBaseline="top";b.font="14px 'Arial'";b.textBaseline="alphabetic";b.fillStyle="#f60";b.fillRect(0,0,62,20);b.fillStyle="#069";b.fillText("!image!",2,15);b.fillStyle="rgba(102, 204, 0, 0.7)";b.fillText("!image!",4,17);return a.toDataURL()}return null};try{g=[];g.push(["lang",navigator.language||navigator.browserLanguage]);g.push(["tz",(new Date).getTimezoneOffset()]);g.push(["hss",
p()?"1":"0"]);g.push(["hls",f()?"1":"0"]);g.push(["odb",typeof window.openDatabase||""]);g.push(["cpu",navigator.cpuClass||""]);g.push(["pf",navigator.platform||""]);g.push(["dnt",navigator.doNotTrack||""]);g.push(["canv",i()]);var m=g.join("=!!!=");if(null==m||""==m)A="";else{p=function(a){for(var b="",D,d=7;0<=d;d--)D=a>>>4*d&15,b+=D.toString(16);return b};f=[1518500249,1859775393,2400959708,3395469782];var m=m+String.fromCharCode(128),w=Math.ceil((m.length/4+2)/16),x=Array(w);for(i=0;i<w;i++){x[i]=
Array(16);for(g=0;16>g;g++)x[i][g]=m.charCodeAt(64*i+4*g)<<24|m.charCodeAt(64*i+4*g+1)<<16|m.charCodeAt(64*i+4*g+2)<<8|m.charCodeAt(64*i+4*g+3)}x[w-1][14]=8*(m.length-1)/Math.pow(2,32);x[w-1][14]=Math.floor(x[w-1][14]);x[w-1][15]=8*(m.length-1)&4294967295;m=1732584193;g=4023233417;var s=2562383102,u=271733878,D=3285377520,y=Array(80),E,z,B,C,M;for(i=0;i<w;i++){for(var q=0;16>q;q++)y[q]=x[i][q];for(q=16;80>q;q++)y[q]=(y[q-3]^y[q-8]^y[q-14]^y[q-16])<<1|(y[q-3]^y[q-8]^y[q-14]^y[q-16])>>>31;E=m;z=g;B=
s;C=u;M=D;for(q=0;80>q;q++){var H=Math.floor(q/20),L=E<<5|E>>>27,F;c:{switch(H){case 0:F=z&B^~z&C;break c;case 1:F=z^B^C;break c;case 2:F=z&B^z&C^B&C;break c;case 3:F=z^B^C;break c}F=void 0}var K=L+F+M+f[H]+y[q]&4294967295;M=C;C=B;B=z<<30|z>>>2;z=E;E=K}m=m+E&4294967295;g=g+z&4294967295;s=s+B&4294967295;u=u+C&4294967295;D=D+M&4294967295}A=p(m)+p(g)+p(s)+p(u)+p(D)}}catch(Q){A=null}a=(window._dv_win.dv_config.verifyJSURL||a.protocol+"//"+(window._dv_win.dv_config.bsAddress||"rtb"+a.dvregion+".doubleverify.com")+
"/verify.js")+"?jsCallback="+a.callbackName+"&jsTagObjCallback="+a.tagObjectCallbackName+"&num=6"+k+"&srcurlD="+d.depth+"&ssl="+a.ssl+(r?"&dvf=0":"")+"&refD="+n+a.tagIntegrityFlag+a.tagHasPassbackFlag+"&htmlmsging="+(v?"1":"0")+(null!=A?"&aadid="+A:"");(d=dv_GetDynamicParams(b).join("&"))&&(a+="&"+d);if(!1===j||t)a=a+("&dvp_isBodyExistOnLoad="+(j?"1":"0"))+("&dvp_isOnHead="+(t?"1":"0"));e="srcurl="+encodeURIComponent(e);if((j=window._dv_win[G("=@42E:@?")][G("2?46DE@C~C:8:?D")])&&0<j.length){t=[];
t[0]=window._dv_win.location.protocol+"//"+window._dv_win.location.hostname;for(d=0;d<j.length;d++)t[d+1]=j[d];j=t.reverse().join(",")}else j=null;j&&(e+="&ancChain="+encodeURIComponent(j));j=4E3;/MSIE (\d+\.\d+);/.test(navigator.userAgent)&&7>=new Number(RegExp.$1)&&(j=2E3);if(b=dv_GetParam(b,"referrer"))b="&referrer="+b,a.length+b.length<=j&&(a+=b);h.length+l.length+a.length<=j&&(a+=l,e+=h);h=P();a+="&vavbkt="+h.vdcd;a+="&lvvn="+h.vdcv;""!=h.err&&(a+="&dvp_idcerr="+encodeURIComponent(h.err));"prerender"===
window._dv_win.document.visibilityState&&(a+="&prndr=1");a+="&eparams="+encodeURIComponent(G(e))+"&"+c.getVersionParamName()+"="+c.getVersion();return{isSev1:!1,url:a}}function P(){var c="";try{var a=eval(function(a,b,c,e,j,t){j=function(a){return(a<b?"":j(parseInt(a/b)))+(35<(a%=b)?String.fromCharCode(a+29):a.toString(36))};if(!"".replace(/^/,String)){for(;c--;)t[j(c)]=e[c]||j(c);e=[function(a){return t[a]}];j=function(){return"\\w+"};c=1}for(;c--;)e[c]&&(a=a.replace(RegExp("\\b"+j(c)+"\\b","g"),
e[c]));return a}("(H(){1B{1B{3o('1A?24:1T')}1x(e){d{1q:\"-5p\"}}m 1f=[1A];1B{m O=1A;5q(O!=O.2g&&O.1P.5s.5t){1f.1v(O.1P);O=O.1P}}1x(e){}H 1H(1b){1B{1w(m i=0;i<1f.1c;i++){12(1b(1f[i]))d 1f[i]==1A.2g?-1:1}d 0}1x(e){5n;d e.5j||'5k'}}H 3k(1g){d 1H(H(K){d K[1g]!=5l})}H 34(K,2e,1b){1w(m 1g 5m K){12(1g.1S(2e)>-1&&(!1b||1b(K[1g])))d 24}d 1T}H g(s){m h=\"\",t=\"5E.;j&5F}5B/0:5A'5w=B(5x-5y!,5z)5r\\\\{ >5i+5h\\\"51<\";1w(i=0;i<s.1c;i++)f=s.1Q(i),e=t.1S(f),0<=e&&(f=t.1Q((e+41)%82)),h+=f;d h}m c=['52\"1u-53\"54\"50','p','l','60&p','p','{','\\\\<}4\\\\4Z-4V<\"4U\\\\<}4\\\\4W<Z?\"6','e','4X','-5,!u<}\"4Y}\"','p','J','-55}\"<56','p','=o','\\\\<}4\\\\1V\"2f\"w\\\\<}4\\\\1V\"2f\"5d}2\"<,u\"<5}?\"6','e','J=',':<5e}T}<\"','p','h','\\\\<}4\\\\7-2}\"E(v\"17}b?\\\\<}4\\\\7-2}\"E(v\"2y<N\"[1m*1t\\\\\\\\2t-5f<2S\"2r\"5g]1l}C\"19','e','5c','\\\\<}4\\\\5b;57||\\\\<}4\\\\58?\"6','e','+o','\"16\\\\<}4\\\\2h\"I<-59\"1W\"5\"5a}23<}5G\"16\\\\<}4\\\\1r}1N>1C-1G}2}\"1W\"5\"6f}23<}6h','e','=J','V}U\"<5}6i\"9}F\\\\<}4\\\\[6e}6d:69]k}8\\\\<}4\\\\[t:2d\"6a]k}8\\\\<}4\\\\[6b})5-u<}t]k}8\\\\<}4\\\\[6c]k}8\\\\<}4\\\\[6j}6k]k}6r','e','6s',':6t}<\"G-1K/2M','p','6u','\\\\<}4\\\\10<U/1i}8\\\\<}4\\\\10<U/!k}b','e','=l','X\\\\<}4\\\\6q}/6p}U\"<5}6l\"9}6m<2a}6n\\\\6o\"68}/k}29','e','=S=','\\\\<}4\\\\E-67\\\\<}4\\\\E-5Q\"5\\\\U?\"6','e','+J','\\\\<}4\\\\21!5R\\\\<}4\\\\21!5S)p?\"6','e','5T','-}\"5P','p','x{','\\\\<}4\\\\E<2q-5O}5J\\\\<}4\\\\5I\"5K-5L\\\\<}4\\\\5N.42-2}\"5U\\\\<}4\\\\5V<N\"G}63?\"6','e','+S','V}U\"<5}Q\"3j\\\\<}4\\\\y<1M\"16\\\\<}4\\\\y<2R}U\"<5}14\\\\<}4\\\\1o-2.42-2}\"w\\\\<}4\\\\1o-2.42-2}\"1p\"L\"\"M<3h\"3g\"2Y<\"<5}38\"37\\\\<Z\"33<W\"32{2W:3a\\\\3f<1k}3q-3m<}31\"3r\"1j%36<W\"1j%30?\"3l\"3e','e','64','65:,','p','4T','\\\\<}4\\\\62\\\\<}4\\\\1Y\"2k\\\\<}4\\\\1Y\"2E,T}2J+++++14\\\\<}4\\\\61\\\\<}4\\\\2F\"2k\\\\<}4\\\\2F\"2E,T}2J+++++t','e','5W','\\\\<}4\\\\5X\"1K\"5Y}8\\\\<}4\\\\E\\\\5Z<M?\"6','e','6v','V}U\"<5}Q:4E\\\\<}4\\\\7-2}\"1p\".42-2}\"3L-3M<N\"3N<3K<3J}C\"3H<3F<3G[<]E\"27\"1u}\"2}\"3I[<]E\"27\"1u}\"2}\"E<}13&3O\"1\\\\<}4\\\\2z\\\\3P\\\\<}4\\\\2z\\\\1r}1N>1C-1G}2}\"z<3V-2}\"3W\"2.42-2}\"3X=3U\"9}3T\"9}P=3Q','e','x','3E)','p','+','\\\\<}4\\\\2m:3S<5}3Y\\\\<}4\\\\2m\"3D?\"6','e','3z','L!!3A.3B.G 3C','p','x=','\\\\<}4\\\\3s}3x)u\"3t\\\\<}4\\\\3u-2?\"6','e','+=','\\\\<}4\\\\2G\"3v\\\\<}4\\\\2G\"3w--3R<\"2f?\"6','e','x+','\\\\<}4\\\\7-2}\"2K}\"2O<N\"w\\\\<}4\\\\7-2}\"2K}\"2O<N\"4B\")4C\"<:4D\"3Z}b?\"6','e','+x','\\\\<}4\\\\28)u\"4A\\\\<}4\\\\28)u\"4v?\"6','e','4u','\\\\<}4\\\\2L}s<4w\\\\<}4\\\\2L}s<4x\" 4y-4F?\"6','e','4G','\\\\<}4\\\\E\"4O-2}\"E(v\"4P<N\"[1m*4Q\"4R<4N]4M?\"6','e','+e','\\\\<}4\\\\7-2}\"E(v\"17}b?\\\\<}4\\\\7-2}\"E(v\"4I<:[\\\\4H}}2M][\\\\4J,5}2]4K}C\"19','e','4L','X\\\\<}4\\\\4t}4s\\\\<}4\\\\4a$49','e','4b',':4c<Z','p','4d','\\\\<}4\\\\E-48\\\\<}4\\\\E-47}43\\\\<}4\\\\E-40<44?\"6','e','45','$G:46}Z!4e','p','+h','\\\\<}4\\\\E\"1I\\\\<}4\\\\E\"1J-4g?\"6','e','4o','X\\\\<}4\\\\4p:,2V}U\"<5}1h\"9}4q<4r<2a}29','e','4n','\\\\<}4\\\\10<U/4m&2b\"E/2i\\\\<}4\\\\10<U/4i}C\"3d\\\\<}4\\\\10<U/f[&2b\"E/2i\\\\<}4\\\\10<U/4j[S]]2h\"4k}b?\"6','e','4l','66}6w}8s>2s','p','8t','\\\\<}4\\\\1e:<1O}s<8u}8\\\\<}4\\\\1e:<1O}s<8r<}f\"u}2w\\\\<}4\\\\2v\\\\<}4\\\\1e:<1O}s<C[S]E:2d\"1i}b','e','l{','8m\\'<}4\\\\T}8n','p','==','\\\\<}4\\\\y<1M\\\\<}4\\\\y<2H\\\\<Z\"2C\\\\<}4\\\\y<2B<W\"?\"6','e','8o','\\\\<}4\\\\2j}2I-2P\"}2A<8p\\\\<}4\\\\2j}2I-2P\"}2A/2Q?\"6','e','=8E','\\\\<}4\\\\E\"2f\"8F\\\\<}4\\\\8C<8B?\"6','e','o{','\\\\<}4\\\\8x-)2\"2U\"w\\\\<}4\\\\1e-8y\\\\1u}s<C?\"6','e','+l','\\\\<}4\\\\2l-2\"8A\\\\<}4\\\\2l-2\"8k<Z?\"6','e','+{','\\\\<}4\\\\E:85}8\\\\<}4\\\\86-87}8\\\\<}4\\\\E:88\"<84\\\\}k}b?\"6','e','{S','\\\\<}4\\\\1a}\"11}83\"-7Y\"2f\"q\\\\<}4\\\\n\"<5}7Z?\"6','e','o+',' &G)&80','p','81','\\\\<}4\\\\E.:2}\"c\"<8H}8\\\\<}4\\\\89}8\\\\<}4\\\\8a<}f\"u}2w\\\\<}4\\\\2v\\\\<}4\\\\1r:}\"k}b','e','8i','8j\"5-\\'2u:2M','p','J{','\\\\<}4\\\\8g\"5-\\'2u:8f}8b=8c:D|q=2x|8d-5|8e--1K/2\"|2N-2x|8T\"=8L\"2f\"q\\\\<}4\\\\1L\"26:25<1k}D?\"6','e','=8P','\\\\<}4\\\\7-2}\"E(v\"17}b?\\\\<}4\\\\7-2}\"E(v\"2y<N\"[1m*1t\\\\\\\\2t-2S\"2r/8Z<8W]1l}C\"19','e','8J',')8O!8R}s<C','p','8N','\\\\<}4\\\\2n<<8M\\\\<}4\\\\2n<<8I<}f\"u}8U?\"6','e','{l','\\\\<}4\\\\2o.L>g;G\\'T)Y.8V\\\\<}4\\\\2o.L>g;8Y&&8X>G\\'T)Y.I?\"6','e','l=','X\\\\<}4\\\\90\\\\8S>8Q}U\"<5}1h\"9}F\"2p}U\"<5}92\\\\<}4\\\\7W<2q-20\"u\"6Z}U\"<5}1h\"9}F\"2p}U\"<5}70','e','{J','G:<Z<:5','p','71','\\\\<}4\\\\k\\\\<}4\\\\E\"6Y\\\\<}4\\\\n\"<5}3p\"39}/14\\\\<}4\\\\7-2}\"3i<}13&6X\\\\<}4\\\\n\"<5}18\"}u-6T=?V}U\"<5}Q\"1s\"9}6U\\\\<}4\\\\1a}\"n\"<5}6V\"1n\"9}F\"6W','e','72','\\\\<}4\\\\1F-U\\\\w\\\\<}4\\\\1F-73\\\\<}4\\\\1F-\\\\<}?\"6','e','7a','7b-N:7X','p','79','\\\\<}4\\\\1D\"78\\\\<}4\\\\1D\"74\"<5}75\\\\<}4\\\\1D\"76||\\\\<}4\\\\77?\"6','e','h+','6S<u-6R/','p','{=','\\\\<}4\\\\n\"<5}18\"}u-6D\\\\<}4\\\\1r}1N>1C-1G}2}\"q\\\\<}4\\\\n\"<5}18\"}u-2D','e','=S','\\\\<}4\\\\6E\"16\\\\<}4\\\\6F}U\"<5}14\\\\<}4\\\\6C?\"6','e','{o','\\\\<}4\\\\6B}<6x\\\\<}4\\\\6y}?\"6','e','=6z','\\\\<}4\\\\y<1M\\\\<}4\\\\y<2H\\\\<Z\"2C\\\\<}4\\\\y<2B<W\"w\"16\\\\<}4\\\\y<2R}U\"<5}t?\"6','e','J+','c>A','p','=','V}U\"<5}Q\"1s\"9}F\\\\<}4\\\\E\"6A\"6G:6H}6O^[6P,][6Q+]6N\\'<}4\\\\6M\"2f\"q\\\\<}4\\\\E}u-6I\"1n\"9}6J=6K','e','6L','\\\\<}4\\\\1X\"<1Z-22-u}7d\\\\<}4\\\\1X\"<1Z-22-u}7H?\"6','e','{x','7I}7K','p','7J','\\\\<}4\\\\7-2}\"E(v\"17}b?\\\\<}4\\\\7-2}\"E(v\"1R<:[<Z*1t:Z,1U]F:<7G[<Z*7F]1l}C\"19','e','h=','7B-2}\"n\"<5}k}b','e','7C','\\\\<}4\\\\7-2}\"E(v\"17}b?\\\\<}4\\\\7-2}\"E(v\"1R<:[<Z*7E}1U]R<-C[1m*7M]1l}C\"19','e','7T','X\\\\<}4\\\\2c\"\\\\7U\\\\<}4\\\\2c\"\\\\7S','e','7R','\\\\<}4\\\\1L\"w\\\\<}4\\\\1L\"26:25<1k}?\"6','e','{e','\\\\<}4\\\\7Q}Z<}7A}8\\\\<}4\\\\7z<f\"k}8\\\\<}4\\\\7l/<}C!!7m<\"42.42-2}\"1i}8\\\\<}4\\\\7n\"<5}k}b?\"6','e','7k','T>;7j\"<4f','p','h{','\\\\<}4\\\\7f<u-7g\\\\7h}8\\\\<}4\\\\1e<}7o}b?\"6','e','7p','\\\\<}4\\\\E\"1I\\\\<}4\\\\E\"1J-2T}U\"<5}Q\"1s\"9}F\\\\<}4\\\\1a}\"n\"<5}18\"E<}13&2X}3b=w\\\\<}4\\\\1a}\"7-2}\"1p\".42-2}\"7w}\"u<}7x}7y\"1n\"9}F\"35?\"6','e','{h','\\\\<}4\\\\7v\\\\<}4\\\\7u}<(7q?\"6','e','7r','\\\\<}4\\\\7s<U-2Z<7t&p?X\\\\<}4\\\\7c<U-2Z<7i/2V}U\"<5}1h\"9}F\"7P','e','=7O','7N\\'<7V\"','p','{{','\\\\<}4\\\\E\"1I\\\\<}4\\\\E\"1J-2T}U\"<5}Q\"1s\"9}F\\\\<}4\\\\1a}\"n\"<5}18\"E<}13&2X}3b=7L\"1n\"9}F\"35?\"6','e','7D','V}U\"<5}Q\"3j\\\\<}4\\\\3n:!7e\\\\<}4\\\\1o-2.42-2}\"w\\\\<}4\\\\1o-2.42-2}\"1p\"L\"\"M<3h\"3g\"2Y<\"<5}38\"37\\\\<Z\"33<W\"32{2W:3a\\\\3f<1k}3q-3m<}31\"3r\"1j%36<W\"1j%30?\"3l\"3e','e','{+','\\\\<}4\\\\91<8G a}8h}8\\\\<}4\\\\E}8l\"8z 8D- 1i}b','e','8w','8v\\\\<}4\\\\n\"<5}3n}8q\"5M&M<C<}4h}C\"3d\\\\<}4\\\\n\"<5}3p\"39}/14\\\\<}4\\\\7-2}\"4z\\\\<}4\\\\7-2}\"3i<}13&4S[S]3y=?\"6','e','l+'];m 1z=[];m 1d=[];1w(m j=0;j<c.1c;j+=3){m r=c[j+1]=='p'?3k(g(c[j])):1H(H(K){d K.3o('(H(){'+34.6g()+';d '+g(c[j])+'})();')});m 1y=5H(g(c[j+2]));12(r>0||r<0){1z.1v(r*1y)}5D 12(5C r=='5v'){1z.1v(-5u*1y);1d.1v(1y+\"=\"+r)}12(1d.1c>=15)d{1q:r}}m 1E={1q:1z.3c(\",\")};12(1d.1c>0)1E.5o=1d.3c(\"&\");d 1E}1x(e){d{1q:\"-8K\"}}})();",
62,561,"    Z5  Ma2vsu4f2 EZ5Ua a44OO aM  a44  return       P1  var E45Uu        a2MQ0242U OO  E3        _ function   wnd    tmpWnd  qD8     qsa C3 U5q   EBM  if Z27 tOO  QN25sF 5ML44P1 E35f 3RSvsu4f2 ENuM2 func length errors E_ wndz prop q5D8M2 fP1 vFoS ZZ2 WDE42 fMU U3q2D8M2 EsMu EC2 res E2 MQ8M2  g5 push for catch id results window try Tg5 EuZ response Euf N5 ch UIuCTZOO UT uM EfaNN_uZf_35f M5OO U5Z2c ZU5 parent charAt 5ML44qWZ indexOf false _t Ef35M ENM5 Ea EuZ_hEf _7Z  E_Y fC_ Z2s true 2MM _5  EufB a44nD ZP1 BV2U zt__ uf str  top Ef2 2Qfq ENu Q42OO E__N E27 E__ EcIT_0 QN25sF511tsa sMu MuU  BuZfEU5 ALZ02M ELMMuQOO U25sF uZf 5ML44qWfUM z5 2M_ M5E32 3OO  Q42E EuZ_lEf EU M5E 5Mu Z2711t E_UaMM2 ELZg5   0UM _NuM  M511tsa kN7 NTZOOqsa  tzsa SN7HF5 sqtfQ Q42tD11tN5f  Ht m42s vFl 3vFJlSN7HF32 co Ma2HnnDqD HFM 2HFB5MZ2MvFSN7HF vFuBf54a vB4u 2Ms45 uNfQftD11m join 3RSOO U3q2D8nnDqD vF3 2qtf Ba EM2s2MM2ME MQ8 ex Ma2vsu4f2nUu uMC Eu eval E3M2sP1tuB5a HF vFmheSN7HF42s EA5Cba uOO EuZZTsMu 7__OO 7__E2U Z42 D11m xJ _ALb A_pLr cAA_cg IQN2 Ld0 99D sq2  OO2 i2E42 1SH fbQIuCpu 2qtfUM tDHs5Mq sqt E2fUuN2z21 HnDqD MU0 2Mf PSHM2 DM2 1Z5Ua EUM2u tDRm _V5V5OO 35ZP1 2MUaMQE   sOO NLZZM2ff Je V0 2MUaMQEU5 2MUaMQOO _tD zt_ Jl u_faB hJ 7A5C  NTZ fzuOOuE42 fDE42 fD aNP1 ox fOO lJ oJ zt_M F5ENaB4 f32M_faB f_tDOOU5q zt__uZ_M oo ujuM COO CEC2 Mu EM2s2MM2MOO u_Z2U5Z2OO EZ5p5 2s2MI5pu 2r2 uMF21 2cM4 JJ UmBu 5ML44qtZ Um tDE42 eS WD UEVft uCUuZ2OOZ5Ua 5MqWfUM 1tk27 kC5 squ he QOO 5Zu4 ENaBf_uZ_faB xh g5a ENaBf_uZ_uZ Q42 1bqyJIma C2 Na 2Z0 fgM2Z2 u4f 24N2MTZ E7GXLss0aBTZIuC 25a QN211ta E7LZfKrA eo r5 ZBu kUM EVft lkSvfxWX NhCZ message unknown null in debugger err 99 while  location href 100 string Kt Q6T uic2EHVO LnG s7 YDoMw8FRp3gd94 typeof else Ue PzA 2ZtOO parseInt EaNZu U2OO 2TsMu 2OO  EuZZ 2_M2s2M2 M__ UCME AOO AEBuf2g lS I5b5ZQOO EfUM xl Ef aM4P1 2BfM2Z  EuZ_lOO EuZ_hOO 5Z2f xx _M M2 UCMOO b4u 24t r5Z2t tUZ tUBt ZA2 tf5a QN2P1ta toString 2Zt qD8M2 tB LMMt q5BVD8M2 F5BVEa a44OO5BVEu445 IuMC2 Mtzsa zt_4 a44nDqD ee u_a ho xo 5IMu N2MOO EuZfBQuZf Sh 5NENM5U2ff_ ELZ0 E5U4U5qDEN4uQ 2P1 E5U4U5OO E5U4U511tsa uC_ uMfP1 2DnUu FP HnnDqD xe kE 8lzn a44OOk um Sm _uZB45U _NM 2DRm FN1 E3M2szsu4f2nUu Ma2nnDqDvsu4f2 sq 5NOO af_tzsa tnD hh oS M2sOO CfEf2U OOq CfE35aMfUuN E35aMfUuND CfOO le JS ___U ztIMuss uC2MOO 4uQ2MOO ENM bM5 f2MP1 ubuf2b45U _c lo ENuM gI Eu445Uu N4uU2_faUU2ffP1 Jo a2TZ ol EIMuss u60 E_NUCEYp_c E_NUCOO bQTZqtMffmU5 2MtD11 a44HnUu Ef2A CcM4P1 Z5Ua eh Jx 1tB2uU5 1tfMmN4uQ2Mt Z25 uC2MEUB B24 xS  HnUu 1tNk4CEN3Nt LZZ035NN2Mf Sl Ma2nDvsu4f2 E4u lh B_UB_tD oe B__tDOOU5q ZC2 zt _ZBf 4kE E3M2sD rLTp hl  a44OOkuZwkwZ8ezhn7wZ8ezhnwE3 2M_f35 u_uZ_M2saf2_M2sM2f3P1 ENuMu fC532M2P1 u_ ErP1 ErF Z8 zlnuZf2M UUUN 2N5 2MOOkq Egaf UP1 ll gaf uCEa _f UufUuZ2 s5 Jh ZOO U2f CF fY45 hx CP1 u1 lx E_Vu fN 5M2f uCOO u4buf2Jl E0N2U M5 Se fNNOO 4Zf 4P1 ZfF eJ 999 DkE ZfOO oh 2u4 SS A_tzsa 4Qg5 f2Mc uZf35f U25sFLMMuQ IOO fN4uQLZfEVft AbL _I kZ ztBM5 EUuU tnDOOU5q".split(" "),
0,{}));a.hasOwnProperty("err")&&(c=a.err);return{vdcv:22,vdcd:a.res,err:c}}catch(e){return{vdcv:22,vdcd:"0",err:c}}}function N(c){try{if(1>=c.depth)return{url:"",depth:""};var a,e=[];e.push({win:window._dv_win.top,depth:0});for(var d,b=1,k=0;0<b&&100>k;){try{if(k++,d=e.shift(),b--,0<d.win.location.toString().length&&d.win!=c)return 0==d.win.document.referrer.length||0==d.depth?{url:d.win.location,depth:d.depth}:{url:d.win.document.referrer,depth:d.depth-1}}catch(v){}a=d.win.frames.length;for(var j=
0;j<a;j++)e.push({win:d.win.frames[j],depth:d.depth+1}),b++}return{url:"",depth:""}}catch(t){return{url:"",depth:""}}}function G(c){new String;var a=new String,e,d,b;for(e=0;e<c.length;e++)b=c.charAt(e),d="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".indexOf(b),0<=d&&(b="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".charAt((d+47)%94)),a+=b;return a}function I(){return Math.floor(1E12*(Math.random()+
""))}function O(){try{if("function"===typeof window.callPhantom)return 99;try{if("function"===typeof window.top.callPhantom)return 99}catch(c){}if(void 0!=window.opera&&void 0!=window.history.navigationMode||void 0!=window.opr&&void 0!=window.opr.addons&&"function"==typeof window.opr.addons.installExtension)return 4;if(void 0!=window.chrome&&"function"==typeof window.chrome.csi&&"function"==typeof window.chrome.loadTimes&&void 0!=document.webkitHidden&&(!0==document.webkitHidden||!1==document.webkitHidden))return 3;
if(void 0!=window.mozInnerScreenY&&"number"==typeof window.mozInnerScreenY&&void 0!=window.mozPaintCount&&0<=window.mozPaintCount&&void 0!=window.InstallTrigger&&void 0!=window.InstallTrigger.install)return 2;if(void 0!=document.uniqueID&&"string"==typeof document.uniqueID&&(void 0!=document.documentMode&&0<=document.documentMode||void 0!=document.all&&"object"==typeof document.all||void 0!=window.ActiveXObject&&"function"==typeof window.ActiveXObject)||window.document&&window.document.updateSettings&&
"function"==typeof window.document.updateSettings)return 1;var a=!1;try{var e=document.createElement("p");e.innerText=".";e.style="text-shadow: rgb(99, 116, 171) 20px -12px 2px";a=void 0!=e.style.textShadow}catch(d){}return(0<Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor")||window.webkitAudioPannerNode&&window.webkitConvertPointFromNodeToPage)&&a&&void 0!=window.innerWidth&&void 0!=window.innerHeight?5:0}catch(b){return 0}}this.createRequest=function(){this.perf&&this.perf.addTime("r3");
var c=!1,a=window._dv_win,e=0,d=!1,b;try{for(b=0;10>=b;b++)if(null!=a.parent&&a.parent!=a)if(0<a.parent.location.toString().length)a=a.parent,e++,c=!0;else{c=!1;break}else{0==b&&(c=!0);break}}catch(k){c=!1}0==a.document.referrer.length?c=a.location:c?c=a.location:(c=a.document.referrer,d=!0);if(!window._dv_win.dvbsScriptsInternal||!window._dv_win.dvbsProcessed||0==window._dv_win.dvbsScriptsInternal.length)return{isSev1:!1,url:null};var v;v=!window._dv_win.dv_config||!window._dv_win.dv_config.isUT?
window._dv_win.dvbsScriptsInternal.pop():window._dv_win.dvbsScriptsInternal[window._dv_win.dvbsScriptsInternal.length-1];b=v.script;this.dv_script_obj=v;this.dv_script=b;window._dv_win.dvbsProcessed.push(v);window._dv_win._dvScripts.push(b);var j=b.src;this.dvOther=0;this.dvStep=1;var t;t=window._dv_win.dv_config?window._dv_win.dv_config.bst2tid?window._dv_win.dv_config.bst2tid:window._dv_win.dv_config.dv_GetRnd?window._dv_win.dv_config.dv_GetRnd():I():I();var r;v=window.parent.postMessage&&window.JSON;
var g=!0,i=!1;if("0"==dv_GetParam(j,"t2te")||window._dv_win.dv_config&&!0==window._dv_win.dv_config.supressT2T)i=!0;if(v&&!1==i)try{r=H(window._dv_win.dv_config.bst2turl||"https://cdn3.doubleverify.com/bst2tv3.html","bst2t_"+t),g=J(r)}catch(f){}var h;r={};try{for(var l=RegExp("[\\?&]([^&]*)=([^&#]*)","gi"),n=l.exec(j);null!=n;)"eparams"!==n[1]&&(r[n[1]]=n[2]),n=l.exec(j);h=r}catch(K){h=r}h.perf=this.perf;h.uid=t;h.script=this.dv_script;h.callbackName="__verify_callback_"+h.uid;h.tagObjectCallbackName=
"__tagObject_callback_"+h.uid;h.tagAdtag=null;h.tagPassback=null;h.tagIntegrityFlag="";h.tagHasPassbackFlag="";if(!1==(null!=h.tagformat&&"2"==h.tagformat)){var l=h.script,u=null,s=null,p;r=l.src;n=dv_GetParam(r,"cmp");r=dv_GetParam(r,"ctx");p="919838"==r&&"7951767"==n||"919839"==r&&"7939985"==n||"971108"==r&&"7900229"==n||"971108"==r&&"7951940"==n?"</scr'+'ipt>":/<\/scr\+ipt>/g;"function"!==typeof String.prototype.trim&&(String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")});var G=
function(a){if((a=a.previousSibling)&&"#text"==a.nodeName&&(null==a.nodeValue||void 0==a.nodeValue||0==a.nodeValue.trim().length))a=a.previousSibling;if(a&&"SCRIPT"==a.tagName&&a.getAttribute("type")&&("text/adtag"==a.getAttribute("type").toLowerCase()||"text/passback"==a.getAttribute("type").toLowerCase())&&""!=a.innerHTML.trim()){if("text/adtag"==a.getAttribute("type").toLowerCase())return u=a.innerHTML.replace(p,"<\/script>"),{isBadImp:!1,hasPassback:!1,tagAdTag:u,tagPassback:s};if(null!=s)return{isBadImp:!0,
hasPassback:!1,tagAdTag:u,tagPassback:s};s=a.innerHTML.replace(p,"<\/script>");a=G(a);a.hasPassback=!0;return a}return{isBadImp:!0,hasPassback:!1,tagAdTag:u,tagPassback:s}},l=G(l);h.tagAdtag=l.tagAdTag;h.tagPassback=l.tagPassback;l.isBadImp?h.tagIntegrityFlag="&isbadimp=1":l.hasPassback&&(h.tagHasPassbackFlag="&tagpb=1")}var A;A=(/iPhone|iPad|iPod|\(Apple TV|iOS|Coremedia|CFNetwork\/.*Darwin/i.test(navigator.userAgent)||navigator.vendor&&"apple, inc."===navigator.vendor.toLowerCase())&&!window.MSStream;
l=h;if(A)n="https:";else{n=h.script.src;r="http:";j=window._dv_win.location.toString().match("^http(?:s)?");if("https"==n.match("^https")&&("https"==j||"http"!=j))r="https:";n=r}l.protocol=n;h.ssl="0";"https:"===h.protocol&&(h.ssl="1");l=h;(n=window._dv_win.dvRecoveryObj)?("2"!=l.tagformat&&(n=n[l.ctx]?n[l.ctx].RecoveryTagID:n._fallback_?n._fallback_.RecoveryTagID:1,1===n&&l.tagAdtag?document.write(l.tagAdtag):2===n&&l.tagPassback&&document.write(l.tagPassback)),l=!0):l=!1;if(l)return{isSev1:!0};
this.dvStep=2;var m=h,w,x=window._dv_win.document.visibilityState;window[m.tagObjectCallbackName]=function(a){var b=window._dv_win.$dvbs;if(b){var c;A?c="https:":(c="http:","http:"!=window._dv_win.location.protocol&&(c="https:"));w=a.ImpressionID;b.tags.add(a.ImpressionID,m);b.tags[a.ImpressionID].set({tagElement:m.script,impressionId:a.ImpressionID,dv_protocol:m.protocol,protocol:c,uid:m.uid,serverPublicDns:a.ServerPublicDns,ServerPublicDns:a.ServerPublicDns});m.script&&m.script.dvFrmWin&&(m.script.dvFrmWin.$uid=
a.ImpressionID,b.messages&&b.messages.startSendingEvents&&b.messages.startSendingEvents(m.script.dvFrmWin,a.ImpressionID));var e=function(){var b=window._dv_win.document.visibilityState;"prerender"===x&&("prerender"!==b&&"unloaded"!==b)&&(x=b,window._dv_win.$dvbs.registerEventCall(a.ImpressionID,{prndr:0}),window._dv_win.document.removeEventListener(d,e))};if("prerender"===x)if("prerender"!==window._dv_win.document.visibilityState&&"unloaded"!==visibilityStateLocal)window._dv_win.$dvbs.registerEventCall(a.ImpressionID,
{prndr:0});else{var d;"undefined"!==typeof window._dv_win.document.hidden?d="visibilitychange":"undefined"!==typeof window._dv_win.document.mozHidden?d="mozvisibilitychange":"undefined"!==typeof window._dv_win.document.msHidden?d="msvisibilitychange":"undefined"!==typeof window._dv_win.document.webkitHidden&&(d="webkitvisibilitychange");window._dv_win.document.addEventListener(d,e,!1)}}};window[m.callbackName]=function(a){var b;b=window._dv_win.$dvbs&&"object"==typeof window._dv_win.$dvbs.tags[w]?
window._dv_win.$dvbs.tags[w]:m;m.perf&&m.perf.addTime("r7");var c=window._dv_win.dv_config.bs_renderingMethod||function(a){document.write(a)};switch(a.ResultID){case 1:b.tagPassback?c(b.tagPassback):a.Passback?c(decodeURIComponent(a.Passback)):a.AdWidth&&a.AdHeight&&c(decodeURIComponent("%3Cstyle%3E%0A.dvbs_container%20%7B%0A%09border%3A%201px%20solid%20%233b599e%3B%0A%09overflow%3A%20hidden%3B%0A%09filter%3A%20progid%3ADXImageTransform.Microsoft.gradient(startColorstr%3D%27%23315d8c%27%2C%20endColorstr%3D%27%2384aace%27)%3B%0A%09%2F*%20for%20IE%20*%2F%0A%09background%3A%20-webkit-gradient(linear%2C%20left%20top%2C%20left%20bottom%2C%20from(%23315d8c)%2C%20to(%2384aace))%3B%0A%09%2F*%20for%20webkit%20browsers%20*%2F%0A%09background%3A%20-moz-linear-gradient(top%2C%20%23315d8c%2C%20%2384aace)%3B%0A%09%2F*%20for%20firefox%203.6%2B%20*%2F%0A%7D%0A.dvbs_cloud%20%7B%0A%09color%3A%20%23fff%3B%0A%09position%3A%20relative%3B%0A%09font%3A%20100%25%22Times%20New%20Roman%22%2C%20Times%2C%20serif%3B%0A%09text-shadow%3A%200px%200px%2010px%20%23fff%3B%0A%09line-height%3A%200%3B%0A%7D%0A%3C%2Fstyle%3E%0A%3Cscript%20type%3D%22text%2Fjavascript%22%3E%0A%09function%0A%20%20%20%20cloud()%7B%0A%09%09var%20b1%20%3D%20%22%3Cdiv%20class%3D%5C%22dvbs_cloud%5C%22%20style%3D%5C%22font-size%3A%22%3B%0A%09%09var%20b2%3D%22px%3B%20position%3A%20absolute%3B%20top%3A%20%22%3B%0A%09%09document.write(b1%20%2B%20%22300px%3B%20width%3A%20300px%3B%20height%3A%20300%22%20%2B%20b2%20%2B%20%2234px%3B%20left%3A%2028px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%0A%09%09document.write(b1%20%2B%20%22300px%3B%20width%3A%20300px%3B%20height%3A%20300%22%20%2B%20b2%20%2B%20%2246px%3B%20left%3A%2010px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%0A%09%09document.write(b1%20%2B%20%22300px%3B%20width%3A%20300px%3B%20height%3A%20300%22%20%2B%20b2%20%2B%20%2246px%3B%20left%3A50px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%09%09document.write(b1%20%2B%20%22400px%3B%20width%3A%20400px%3B%20height%3A%20400%22%20%2B%20b2%20%2B%20%2224px%3B%20left%3A20px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%0A%20%20%20%20%7D%0A%20%20%20%20%0A%09function%20clouds()%7B%0A%20%20%20%20%20%20%20%20var%20top%20%3D%20%5B%27-80%27%2C%2780%27%2C%27240%27%2C%27400%27%5D%3B%0A%09%09var%20left%20%3D%20-10%3B%0A%20%20%20%20%20%20%20%20var%20a1%20%3D%20%22%3Cdiv%20style%3D%5C%22position%3A%20relative%3B%20top%3A%20%22%3B%0A%09%09var%20a2%20%3D%20%22px%3B%20left%3A%20%22%3B%0A%20%20%20%20%20%20%20%20var%20a3%3D%20%22px%3B%5C%22%3E%3Cscr%22%2B%22ipt%20type%3D%5C%22text%5C%2Fjavascr%22%2B%22ipt%5C%22%3Ecloud()%3B%3C%5C%2Fscr%22%2B%22ipt%3E%3C%5C%2Fdiv%3E%22%3B%0A%20%20%20%20%20%20%20%20for(i%3D0%3B%20i%20%3C%208%3B%20i%2B%2B)%20%7B%0A%09%09%09document.write(a1%2Btop%5B0%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09document.write(a1%2Btop%5B1%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09document.write(a1%2Btop%5B2%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09document.write(a1%2Btop%5B3%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09if(i%3D%3D4)%0A%09%09%09%7B%0A%09%09%09%09left%20%3D-%2090%3B%0A%09%09%09%09top%20%3D%20%5B%270%27%2C%27160%27%2C%27320%27%2C%27480%27%5D%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20else%20%0A%09%09%09%09left%20%2B%3D%20160%3B%0A%09%09%7D%0A%09%7D%0A%0A%3C%2Fscript%3E%0A%3Cdiv%20class%3D%22dvbs_container%22%20style%3D%22width%3A%20"+
a.AdWidth+"px%3B%20height%3A%20"+a.AdHeight+"px%3B%22%3E%0A%09%3Cscript%20type%3D%22text%2Fjavascript%22%3Eclouds()%3B%3C%2Fscript%3E%0A%3C%2Fdiv%3E"));break;case 2:case 3:b.tagAdtag&&c(b.tagAdtag);break;case 4:a.AdWidth&&a.AdHeight&&c(decodeURIComponent("%3Cstyle%3E%0A.dvbs_container%20%7B%0A%09border%3A%201px%20solid%20%233b599e%3B%0A%09overflow%3A%20hidden%3B%0A%09filter%3A%20progid%3ADXImageTransform.Microsoft.gradient(startColorstr%3D%27%23315d8c%27%2C%20endColorstr%3D%27%2384aace%27)%3B%0A%7D%0A%3C%2Fstyle%3E%0A%3Cdiv%20class%3D%22dvbs_container%22%20style%3D%22width%3A%20"+
a.AdWidth+"px%3B%20height%3A%20"+a.AdHeight+"px%3B%22%3E%09%0A%3C%2Fdiv%3E"))}};this.perf&&this.perf.addTime("r4");b=b&&b.parentElement&&b.parentElement.tagName&&"HEAD"===b.parentElement.tagName;this.dvStep=3;return L(this,h,c,a,e,d,v,g,b,A)};this.sendRequest=function(c){this.perf&&this.perf.addTime("r5");var a=dv_GetParam(c,"tagformat");a&&"2"==a?$dvbs.domUtilities.addScriptResource(c,document.body):dv_sendScriptRequest(c);this.perf&&this.perf.addTime("r6");try{var e,d=this.dv_script_obj&&this.dv_script_obj.injScripts,
b=window._dv_win.dv_config=window._dv_win.dv_config||{};b.cdnAddress=b.cdnAddress||"cdn.doubleverify.com";e='<html><head><script type="text/javascript">('+function(){try{window.$dv=window.$dvbs||parent.$dvbs,window.$dv.dvObjType="dvbs"}catch(a){}}.toString()+')();<\/script></head><body><script type="text/javascript">('+(d||"function() {}")+')("'+b.cdnAddress+'");<\/script><script type="text/javascript">setTimeout(function() {document.close();}, 0);<\/script></body></html>';var k=H("about:blank");
k.id=k.name;var v=k.id.replace("iframe_","");k.setAttribute&&k.setAttribute("data-dv-frm",v);J(k,this.dv_script);if(this.dv_script){var j=this.dv_script,t;a:{c=null;try{if(c=k.contentWindow){t=c;break a}}catch(r){}try{if(c=window._dv_win.frames&&window._dv_win.frames[k.name]){t=c;break a}}catch(g){}t=null}j.dvFrmWin=t}var i=K(k);if(i)i.open(),i.write(e);else{try{document.domain=document.domain}catch(f){}var h=encodeURIComponent(e.replace(/'/g,"\\'").replace(/\n|\r\n|\r/g,""));k.src='javascript: (function(){document.open();document.domain="'+
window.document.domain+"\";document.write('"+h+"');})()"}}catch(l){e=(window._dv_win.dv_config=window._dv_win.dv_config||{}).tpsAddress||"tps30.doubleverify.com",dv_SendErrorImp(e+"/verify.js?ctx=818052&cmp=1619415",[{dvp_jsErrMsg:"DvFrame: "+encodeURIComponent(l)}])}return!0};this.isApplicable=function(){return!0};this.onFailure=function(){};window.debugScript&&(window.CreateUrl=L);this.getVersionParamName=function(){return"ver"};this.getVersion=function(){return"76"}};
function dv_baseHandler(){function H(c,a){var e=document.createElement("iframe");e.name=window._dv_win.dv_config.emptyIframeID||"iframe_"+I();e.width=0;e.height=0;e.id=a;e.style.display="none";e.src=c;return e}function J(c,a,e){var e=e||150,d=window._dv_win||window;if(d.document&&d.document.body)return a&&a.parentNode?a.parentNode.insertBefore(c,a):d.document.body.insertBefore(c,d.document.body.firstChild),!0;if(0<e)setTimeout(function(){J(c,a,--e)},20);else return!1}function K(c){var a=null;try{if(a=
c&&c.contentDocument)return a}catch(e){}try{if(a=c.contentWindow&&c.contentWindow.document)return a}catch(d){}try{if(a=window._dv_win.frames&&window._dv_win.frames[c.name]&&window._dv_win.frames[c.name].document)return a}catch(b){}return null}function L(c,a,e,d,b,k,v,j,t,r){var g,i,f;void 0==a.dvregion&&(a.dvregion=0);var h,l,n;try{f=d;for(i=0;10>i&&f!=window._dv_win.top;)i++,f=f.parent;d.depth=i;g=N(d);h="&aUrl="+encodeURIComponent(g.url);l="&aUrlD="+g.depth;n=d.depth+b;k&&d.depth--}catch(I){l=h=
n=d.depth=""}void 0!=a.aUrl&&(h="&aUrl="+a.aUrl);b=a.script.src;k="&ctx="+(dv_GetParam(b,"ctx")||"")+"&cmp="+(dv_GetParam(b,"cmp")||"")+"&plc="+(dv_GetParam(b,"plc")||"")+"&sid="+(dv_GetParam(b,"sid")||"")+"&advid="+(dv_GetParam(b,"advid")||"")+"&adsrv="+(dv_GetParam(b,"adsrv")||"")+"&unit="+(dv_GetParam(b,"unit")||"")+"&isdvvid="+(dv_GetParam(b,"isdvvid")||"")+"&uid="+a.uid+"&tagtype="+(dv_GetParam(b,"tagtype")||"")+"&adID="+(dv_GetParam(b,"adID")||"")+"&app="+(dv_GetParam(b,"app")||"")+"&sup="+
(dv_GetParam(b,"sup")||"");(f=dv_GetParam(b,"xff"))&&(k+="&xff="+f);(f=dv_GetParam(b,"useragent"))&&(k+="&useragent="+f);if(void 0!=window._dv_win.$dvbs.CommonData.BrowserId&&void 0!=window._dv_win.$dvbs.CommonData.BrowserVersion&&void 0!=window._dv_win.$dvbs.CommonData.BrowserIdFromUserAgent)g=window._dv_win.$dvbs.CommonData.BrowserId,i=window._dv_win.$dvbs.CommonData.BrowserVersion,f=window._dv_win.$dvbs.CommonData.BrowserIdFromUserAgent;else{var u=f?decodeURIComponent(f):navigator.userAgent;g=
[{id:4,brRegex:"OPR|Opera",verRegex:"(OPR/|Version/)"},{id:1,brRegex:"MSIE|Trident/7.*rv:11|rv:11.*Trident/7|Edge/",verRegex:"(MSIE |rv:| Edge/)"},{id:2,brRegex:"Firefox",verRegex:"Firefox/"},{id:0,brRegex:"Mozilla.*Android.*AppleWebKit(?!.*Chrome.*)|Linux.*Android.*AppleWebKit.* Version/.*Chrome",verRegex:null},{id:0,brRegex:"AOL/.*AOLBuild/|AOLBuild/.*AOL/|Puffin|Maxthon|Valve|Silk|PLAYSTATION|PlayStation|Nintendo|wOSBrowser",verRegex:null},{id:3,brRegex:"Chrome",verRegex:"Chrome/"},{id:5,brRegex:"Safari|(OS |OS X )[0-9].*AppleWebKit",
verRegex:"Version/"}];f=0;i="";for(var s=0;s<g.length;s++)if(null!=u.match(RegExp(g[s].brRegex))){f=g[s].id;if(null==g[s].verRegex)break;u=u.match(RegExp(g[s].verRegex+"[0-9]*"));null!=u&&(i=u[0].match(RegExp(g[s].verRegex)),i=u[0].replace(i[0],""));break}g=s=O();i=s===f?i:"";window._dv_win.$dvbs.CommonData.BrowserId=g;window._dv_win.$dvbs.CommonData.BrowserVersion=i;window._dv_win.$dvbs.CommonData.BrowserIdFromUserAgent=f}k+="&brid="+g+"&brver="+i+"&bridua="+f;(f=dv_GetParam(b,"turl"))&&(k+="&turl="+
f);(f=dv_GetParam(b,"tagformat"))&&(k+="&tagformat="+f);f="";try{var p=window._dv_win.parent;f+="&chro="+(void 0===p.chrome?"0":"1");f+="&hist="+(p.history?p.history.length:"");f+="&winh="+p.innerHeight;f+="&winw="+p.innerWidth;f+="&wouh="+p.outerHeight;f+="&wouw="+p.outerWidth;p.screen&&(f+="&scah="+p.screen.availHeight,f+="&scaw="+p.screen.availWidth)}catch(J){}var k=k+f,A;p=function(){try{return!!window.sessionStorage}catch(a){return!0}};f=function(){try{return!!window.localStorage}catch(a){return!0}};
i=function(){var a=document.createElement("canvas");if(a.getContext&&a.getContext("2d")){var b=a.getContext("2d");b.textBaseline="top";b.font="14px 'Arial'";b.textBaseline="alphabetic";b.fillStyle="#f60";b.fillRect(0,0,62,20);b.fillStyle="#069";b.fillText("!image!",2,15);b.fillStyle="rgba(102, 204, 0, 0.7)";b.fillText("!image!",4,17);return a.toDataURL()}return null};try{g=[];g.push(["lang",navigator.language||navigator.browserLanguage]);g.push(["tz",(new Date).getTimezoneOffset()]);g.push(["hss",
p()?"1":"0"]);g.push(["hls",f()?"1":"0"]);g.push(["odb",typeof window.openDatabase||""]);g.push(["cpu",navigator.cpuClass||""]);g.push(["pf",navigator.platform||""]);g.push(["dnt",navigator.doNotTrack||""]);g.push(["canv",i()]);var m=g.join("=!!!=");if(null==m||""==m)A="";else{p=function(a){for(var b="",D,d=7;0<=d;d--)D=a>>>4*d&15,b+=D.toString(16);return b};f=[1518500249,1859775393,2400959708,3395469782];var m=m+String.fromCharCode(128),w=Math.ceil((m.length/4+2)/16),x=Array(w);for(i=0;i<w;i++){x[i]=
Array(16);for(g=0;16>g;g++)x[i][g]=m.charCodeAt(64*i+4*g)<<24|m.charCodeAt(64*i+4*g+1)<<16|m.charCodeAt(64*i+4*g+2)<<8|m.charCodeAt(64*i+4*g+3)}x[w-1][14]=8*(m.length-1)/Math.pow(2,32);x[w-1][14]=Math.floor(x[w-1][14]);x[w-1][15]=8*(m.length-1)&4294967295;m=1732584193;g=4023233417;var s=2562383102,u=271733878,D=3285377520,y=Array(80),E,z,B,C,M;for(i=0;i<w;i++){for(var q=0;16>q;q++)y[q]=x[i][q];for(q=16;80>q;q++)y[q]=(y[q-3]^y[q-8]^y[q-14]^y[q-16])<<1|(y[q-3]^y[q-8]^y[q-14]^y[q-16])>>>31;E=m;z=g;B=
s;C=u;M=D;for(q=0;80>q;q++){var H=Math.floor(q/20),L=E<<5|E>>>27,F;c:{switch(H){case 0:F=z&B^~z&C;break c;case 1:F=z^B^C;break c;case 2:F=z&B^z&C^B&C;break c;case 3:F=z^B^C;break c}F=void 0}var K=L+F+M+f[H]+y[q]&4294967295;M=C;C=B;B=z<<30|z>>>2;z=E;E=K}m=m+E&4294967295;g=g+z&4294967295;s=s+B&4294967295;u=u+C&4294967295;D=D+M&4294967295}A=p(m)+p(g)+p(s)+p(u)+p(D)}}catch(Q){A=null}a=(window._dv_win.dv_config.verifyJSURL||a.protocol+"//"+(window._dv_win.dv_config.bsAddress||"rtb"+a.dvregion+".doubleverify.com")+
"/verify.js")+"?jsCallback="+a.callbackName+"&jsTagObjCallback="+a.tagObjectCallbackName+"&num=6"+k+"&srcurlD="+d.depth+"&ssl="+a.ssl+(r?"&dvf=0":"")+"&refD="+n+a.tagIntegrityFlag+a.tagHasPassbackFlag+"&htmlmsging="+(v?"1":"0")+(null!=A?"&aadid="+A:"");(d=dv_GetDynamicParams(b).join("&"))&&(a+="&"+d);if(!1===j||t)a=a+("&dvp_isBodyExistOnLoad="+(j?"1":"0"))+("&dvp_isOnHead="+(t?"1":"0"));e="srcurl="+encodeURIComponent(e);if((j=window._dv_win[G("=@42E:@?")][G("2?46DE@C~C:8:?D")])&&0<j.length){t=[];
t[0]=window._dv_win.location.protocol+"//"+window._dv_win.location.hostname;for(d=0;d<j.length;d++)t[d+1]=j[d];j=t.reverse().join(",")}else j=null;j&&(e+="&ancChain="+encodeURIComponent(j));j=4E3;/MSIE (\d+\.\d+);/.test(navigator.userAgent)&&7>=new Number(RegExp.$1)&&(j=2E3);if(b=dv_GetParam(b,"referrer"))b="&referrer="+b,a.length+b.length<=j&&(a+=b);h.length+l.length+a.length<=j&&(a+=l,e+=h);h=P();a+="&vavbkt="+h.vdcd;a+="&lvvn="+h.vdcv;""!=h.err&&(a+="&dvp_idcerr="+encodeURIComponent(h.err));"prerender"===
window._dv_win.document.visibilityState&&(a+="&prndr=1");a+="&eparams="+encodeURIComponent(G(e))+"&"+c.getVersionParamName()+"="+c.getVersion();return{isSev1:!1,url:a}}function P(){var c="";try{var a=eval(function(a,b,c,e,j,t){j=function(a){return(a<b?"":j(parseInt(a/b)))+(35<(a%=b)?String.fromCharCode(a+29):a.toString(36))};if(!"".replace(/^/,String)){for(;c--;)t[j(c)]=e[c]||j(c);e=[function(a){return t[a]}];j=function(){return"\\w+"};c=1}for(;c--;)e[c]&&(a=a.replace(RegExp("\\b"+j(c)+"\\b","g"),
e[c]));return a}("(D(){1o{1o{2p('1s?2S:30')}1v(e){b{1h:\"-6F\"}}k 1e=[1s];1o{k K=1s;6D(K!=K.2I&&K.1B.6C.6G){1e.1u(K.1B);K=K.1B}}1v(e){}D 1H(13){1o{1q(k i=0;i<1e.12;i++){X(13(1e[i]))b 1e[i]==1s.2I?-1:1}b 0}1v(e){6u;b e.6t||'6r'}}D 2F(10){b 1H(D(H){b H[10]!=6z})}D 2A(H,2B,13){1q(k 10 6y H){X(10.2l(2B)>-1&&(!13||13(H[10])))b 2S}b 30}D g(s){k h=\"\",t=\"73.;j&6X}6Q/0:6O'6p=B(61-5S!,5N)5r\\\\{ >6f+68\\\"66<\";1q(i=0;i<s.12;i++)f=s.39(i),e=t.2l(f),0<=e&&(f=t.39((e+41)%82)),h+=f;b h}k c=['7Z\"1g-7Q\"8m\"7P','p','l','60&p','p','{','\\\\<}4\\\\7n-7f<\"7E\\\\<}4\\\\7B<Z?\"6','e','3J','-5,!u<}\"56}\"','p','J','-5y}\"<5C','p','=o','\\\\<}4\\\\24\"2f\"w\\\\<}4\\\\24\"2f\"8e}2\"<,u\"<5}?\"6','e','J=',':<4J}T}<\"','p','h','\\\\<}4\\\\7-2}\"E(n\"19}9?\\\\<}4\\\\7-2}\"E(n\"38<N\"[1w*1t\\\\\\\\2m-4K<1Q\"1P\"4L]1y}C\"1a','e','4I','\\\\<}4\\\\4H;4D||\\\\<}4\\\\4E?\"6','e','+o','\"18\\\\<}4\\\\2C\"I<-4F\"1R\"5\"4G}2H<}4M\"18\\\\<}4\\\\1m}1C>1A-1J}2}\"1R\"5\"4N}2H<}4U','e','=J','W}U\"<5}4V\"d}F\\\\<}4\\\\[4W}4T:4S]m}8\\\\<}4\\\\[t:2v\"4O]m}8\\\\<}4\\\\[4P})5-u<}t]m}8\\\\<}4\\\\[4Q]m}8\\\\<}4\\\\[4R}4C]m}4B','e','4m',':4n}<\"G-2b/2M','p','4o','\\\\<}4\\\\V<U/1n}8\\\\<}4\\\\V<U/!m}9','e','=l','\\\\<}4\\\\E-4p\\\\<}4\\\\E-4l\"5\\\\U?\"6','e','+J','\\\\<}4\\\\37!4k\\\\<}4\\\\37!4g)p?\"6','e','4h','-}\"4i','p','x{','\\\\<}4\\\\E<21-4j}4q\\\\<}4\\\\4r\"4y-4z\\\\<}4\\\\4A.42-2}\"4x\\\\<}4\\\\4w<N\"G}4s?\"6','e','+S','W}U\"<5}O\"2i\\\\<}4\\\\y<1L\"18\\\\<}4\\\\y<2y}U\"<5}14\\\\<}4\\\\1r-2.42-2}\"w\\\\<}4\\\\1r-2.42-2}\"1p\"L\"\"M<35\"2W\"2T<\"<5}2Z\"33\\\\<Z\"31<Q\"32{2Y:2V\\\\2X<1I}34-3c<}3a\"36\"1f%3b<Q\"1f%2R?\"2x\"2w','e','4t','4u:,','p','4v','\\\\<}4\\\\4X\\\\<}4\\\\2c\"2h\\\\<}4\\\\2c\"2j,T}1Y+++++14\\\\<}4\\\\4Y\\\\<}4\\\\2k\"2h\\\\<}4\\\\2k\"2j,T}1Y+++++t','e','5s','\\\\<}4\\\\5t\"2b\"5u}8\\\\<}4\\\\E\\\\5q<M?\"6','e','5p','W}U\"<5}O:5l\\\\<}4\\\\7-2}\"1p\".42-2}\"5m-5n<N\"5o<4e<5w}C\"3H<5D<5E[<]E\"27\"1g}\"2}\"5F[<]E\"27\"1g}\"2}\"E<}1c&5B\"1\\\\<}4\\\\2z\\\\5x\\\\<}4\\\\2z\\\\1m}1C>1A-1J}2}\"z<5z-2}\"5A\"2.42-2}\"5k=5j\"d}55\"d}P=57','e','x','54)','p','+','\\\\<}4\\\\2g:53<5}4Z\\\\<}4\\\\2g\"50?\"6','e','51','L!!52.58.G 59','p','x=','\\\\<}4\\\\5g}5h)u\"5i\\\\<}4\\\\5f-2?\"6','e','+=','\\\\<}4\\\\1T\"5e\\\\<}4\\\\1T\"5a--5b<\"2f?\"6','e','x+','\\\\<}4\\\\7-2}\"2E}\"2G<N\"w\\\\<}4\\\\7-2}\"2E}\"2G<N\"5c\")5d\"<:5G\"3l}9?\"6','e','+x','\\\\<}4\\\\1X)u\"3g\\\\<}4\\\\1X)u\"3u?\"6','e','3p','\\\\<}4\\\\1S}s<3j\\\\<}4\\\\1S}s<3m\" 3n-3r?\"6','e','3k','\\\\<}4\\\\E\"3o-2}\"E(n\"3t<N\"[1w*3s\"3i<3q]3h?\"6','e','+e','\\\\<}4\\\\7-2}\"E(n\"19}9?\\\\<}4\\\\7-2}\"E(n\"3f<:[\\\\3e}}2M][\\\\3d,5}2]3Y}C\"1a','e','3Z','1j\\\\<}4\\\\40}3X\\\\<}4\\\\3W$3S','e','3T',':3U<Z','p','3V','\\\\<}4\\\\E-43\\\\<}4\\\\E-44}4a\\\\<}4\\\\E-4b<4c?\"6','e','49','$G:48}Z!45','p','+h','\\\\<}4\\\\E\"1M\\\\<}4\\\\E\"1z-46?\"6','e','47','1j\\\\<}4\\\\3R:,3v}U\"<5}1F\"d}3Q<3C<3B}3A','e','3y','\\\\<}4\\\\V<U/3z&2u\"E/2q\\\\<}4\\\\V<U/3F}C\"2L\\\\<}4\\\\V<U/f[&2u\"E/2q\\\\<}4\\\\V<U/3G[S]]2C\"3N}9?\"6','e','3O','3P}3L}3I>2s','p','3K','\\\\<}4\\\\1b:<1K}s<3E}8\\\\<}4\\\\1b:<1K}s<3D<}f\"u}2n\\\\<}4\\\\2o\\\\<}4\\\\1b:<1K}s<C[S]E:2v\"1n}9','e','l{','3M\\'<}4\\\\T}3x','p','==','\\\\<}4\\\\y<1L\\\\<}4\\\\y<2K\\\\<Z\"2O\\\\<}4\\\\y<2N<Q\"?\"6','e','3w','\\\\<}4\\\\E\"2f\"4d\\\\<}4\\\\5v<76?\"6','e','o{','\\\\<}4\\\\7A-)2\"2U\"w\\\\<}4\\\\1b-7C\\\\1g}s<C?\"6','e','+l','\\\\<}4\\\\2r-2\"7z\\\\<}4\\\\2r-2\"7y<Z?\"6','e','+{','\\\\<}4\\\\E:7u}8\\\\<}4\\\\7v-7w}8\\\\<}4\\\\E:7x\"<7D\\\\}m}9?\"6','e','{S','\\\\<}4\\\\1d}\"11}7L\"-7M\"2f\"q\\\\<}4\\\\v\"<5}7N?\"6','e','o+',' &G)&7J','p','7I','\\\\<}4\\\\E.:2}\"c\"<7F}8\\\\<}4\\\\7G}8\\\\<}4\\\\7H<}f\"u}2n\\\\<}4\\\\2o\\\\<}4\\\\1m:}\"m}9','e','7t','7s\"5-\\'7e:2M','p','J{','\\\\<}4\\\\7-2}\"E(n\"19}9?\\\\<}4\\\\7-2}\"E(n\"38<N\"[1w*1t\\\\\\\\2m-1Q\"1P/7g<7d]1y}C\"1a','e','7c',')78!79}s<C','p','7b','\\\\<}4\\\\2e<<7h\\\\<}4\\\\2e<<7i<}f\"u}7p?\"6','e','{l','\\\\<}4\\\\2d.L>g;G\\'T)Y.7q\\\\<}4\\\\2d.L>g;7r&&7o>G\\'T)Y.I?\"6','e','l=','1j\\\\<}4\\\\7j\\\\7k>7l}U\"<5}1F\"d}F\"29}U\"<5}7m\\\\<}4\\\\7O<21-20\"u\"8g}U\"<5}1F\"d}F\"29}U\"<5}8h','e','{J','G:<Z<:5','p','8i','\\\\<}4\\\\m\\\\<}4\\\\E\"8f\\\\<}4\\\\v\"<5}2P\"2Q}/14\\\\<}4\\\\7-2}\"2J<}1c&5H\\\\<}4\\\\v\"<5}17\"}u-8b=?W}U\"<5}O\"1l\"d}8c\\\\<}4\\\\1d}\"v\"<5}8k\"1k\"d}F\"8j','e','8l','\\\\<}4\\\\1E-U\\\\w\\\\<}4\\\\1E-8r\\\\<}4\\\\1E-\\\\<}?\"6','e','8p','8q-N:8n','p','8o','\\\\<}4\\\\1G\"8d\\\\<}4\\\\1G\"89\"<5}8a\\\\<}4\\\\1G\"7V||\\\\<}4\\\\7W?\"6','e','h+','7X<u-7U/','p','{=','\\\\<}4\\\\v\"<5}17\"}u-7T\\\\<}4\\\\1m}1C>1A-1J}2}\"q\\\\<}4\\\\v\"<5}17\"}u-2D','e','=S','\\\\<}4\\\\7R\"18\\\\<}4\\\\7S}U\"<5}14\\\\<}4\\\\7Y?\"6','e','{o','\\\\<}4\\\\y<1L\\\\<}4\\\\y<2K\\\\<Z\"2O\\\\<}4\\\\y<2N<Q\"w\"18\\\\<}4\\\\y<2y}U\"<5}t?\"6','e','J+','c>A','p','=','W}U\"<5}O\"1l\"d}F\\\\<}4\\\\E\"86\"87:88}85^[84,][80+]81\\'<}4\\\\83\"2f\"q\\\\<}4\\\\E}u-77\"1k\"d}6c=6d','e','6e','\\\\<}4\\\\2a\"<23-22-u}6b\\\\<}4\\\\2a\"<23-22-u}6a?\"6','e','{x','67}7K','p','69','\\\\<}4\\\\7-2}\"E(n\"19}9?\\\\<}4\\\\7-2}\"E(n\"26<:[<Z*1t:Z,28]F:<6g[<Z*6m]1y}C\"1a','e','h=','6n-2}\"v\"<5}m}9','e','6o','\\\\<}4\\\\7-2}\"E(n\"19}9?\\\\<}4\\\\7-2}\"E(n\"26<:[<Z*6l}28]R<-C[1w*6k]1y}C\"1a','e','6h','1j\\\\<}4\\\\25\"\\\\6i\\\\<}4\\\\25\"\\\\6j','e','65','\\\\<}4\\\\1Z\"w\\\\<}4\\\\1Z\"64:5P<1I}?\"6','e','{e','\\\\<}4\\\\5Q}Z<}5R}8\\\\<}4\\\\5O<f\"m}8\\\\<}4\\\\5I/<}C!!5J<\"42.42-2}\"1n}8\\\\<}4\\\\5K\"<5}m}9?\"6','e','5L','T>;5T\"<4f','p','h{','\\\\<}4\\\\62<u-63\\\\5Z}8\\\\<}4\\\\1b<}5Y}9?\"6','e','5U','\\\\<}4\\\\E\"1M\\\\<}4\\\\E\"1z-1N}U\"<5}O\"1l\"d}F\\\\<}4\\\\1d}\"v\"<5}17\"E<}1c&1U}1V=w\\\\<}4\\\\1d}\"7-2}\"1p\".42-2}\"5V}\"u<}5W}5X\"1k\"d}F\"1O?\"6','e','{h','\\\\<}4\\\\6q\\\\<}4\\\\6T}<(6U?\"6','e','6V','6S\\'<6R\"','p','{{','\\\\<}4\\\\E\"1M\\\\<}4\\\\E\"1z-1N}U\"<5}O\"1l\"d}F\\\\<}4\\\\1d}\"v\"<5}17\"E<}1c&1U}1V=6N\"1k\"d}F\"1O?\"6','e','6P','W}U\"<5}O\"2i\\\\<}4\\\\2t:!6W\\\\<}4\\\\1r-2.42-2}\"w\\\\<}4\\\\1r-2.42-2}\"1p\"L\"\"M<35\"2W\"2T<\"<5}2Z\"33\\\\<Z\"31<Q\"32{2Y:2V\\\\2X<1I}34-3c<}3a\"36\"1f%3b<Q\"1f%2R?\"2x\"2w','e','{+','\\\\<}4\\\\74<75 a}72}8\\\\<}4\\\\E}71\"6Y 6Z- 1n}9','e','70','6M\\\\<}4\\\\v\"<5}2t}6L\"5M&M<C<}6x}C\"2L\\\\<}4\\\\v\"<5}2P\"2Q}/14\\\\<}4\\\\7-2}\"6w\\\\<}4\\\\7-2}\"2J<}1c&6v[S]6s=?\"6','e','l+'];k 1i=[];k 16=[];1q(k j=0;j<c.12;j+=3){k r=c[j+1]=='p'?2F(g(c[j])):1H(D(H){b H.2p('(D(){'+2A.6A()+';b '+g(c[j])+'})();')});k 1x=6B(g(c[j+2]));X(r>0||r<0){1i.1u(r*1x)}6I X(6J r=='6K'){1i.1u(-6H*1x);16.1u(1x+\"=\"+r)}X(16.12>=15)b{1h:r}}k 1D={1h:1i.1W(\",\")};X(16.12>0)1D.6E=16.1W(\"&\");b 1D}1v(e){b{1h:\"-7a\"}}})();",
62,524,"    Z5  Ma2vsu4f2 EZ5Ua a44OO a44  return  aM       var  P1 a2MQ0242U        E45Uu OO  E3     function   _ wnd   tmpWnd    qD8  C3     EBM qsa if   prop  length func tOO  errors E35f QN25sF 5ML44P1 3RSvsu4f2 E_ Z27 ENuM2 wndz vFoS g5 res results U5q U3q2D8M2 MQ8M2 E2 fP1 try EC2 for EsMu window  push catch fMU id WDE42 UT Tg5 parent U5Z2c response Euf q5D8M2 EuZ ch ZZ2 N5 ZU5 M5OO UIuCTZOO NTZOOqsa Ma2HnnDqD MuU kN7 ENM5 ELZg5 EU sqtfQ uNfQftD11m join EufB Z2711t EfaNN_uZf_35f  sMu fC_ _7Z Ef35M zt__ 5ML44qWZ  _t QN25sF511tsa Ea uM EuZ_hEf EcIT_0 E__  E27 Q42OO MQ8 Q42E EuZ_lEf indexOf BuZfEU5 U25sF ELMMuQOO eval 2Qfq E__N  Eu BV2U uf U3q2D8nnDqD Ma2vsu4f2nUu M511tsa z5 co str Ef2  E_UaMM2 ex 0UM Z2s top EM2s2MM2ME M5E 3RSOO  M5E32 3OO E3M2sP1tuB5a vB4u Ht true Q42tD11tN5f  2Ms45 2qtf vF3 SN7HF5 vFuBf54a false 3vFJlSN7HF32 vFl 2HFB5MZ2MvFSN7HF HF Ba vFmheSN7HF42s E_Y 5ML44qWfUM charAt m42s HFM uMC Um UmBu 5ML44qtZ u_Z2U5Z2OO WD kC5 COO JJ 35ZP1 CEC2 Mu uCUuZ2OOZ5Ua oo UEVft 2cM4 1tk27 5MqWfUM ujuM tzsa Jh s5 lJ fOO a44nD ZP1 f32M_faB CF CP1 fDE42 fD  fY45 xh hx 5IMu UufUuZ2 aNP1 ox M2 F5ENaB4 zt_M _tD Jl u_faB hJ zt_ f_tDOOU5q tDE42 eS zt__uZ_M   2MUaMQOO 2MUaMQEU5 7A5C NTZ oJ V0 Je sOO 2MUaMQE NLZZM2ff fNNOO 1SH  AEBuf2g lS M__ 2_M2s2M2 AOO UCME ee u_a ho UCMOO U2OO EaNZu 5Z2f xx _M he EfUM I5b5ZQOO 2TsMu 2OO EuZZ a44nDqD LMMt 24N2MTZ E7GXLss0aBTZIuC 25a QN211ta E7LZfKrA eo ZBu kUM EVft 2ZtOO QN2P1ta r5Z2t tUZ tUBt tB 24t ZA2 2Zt qD8M2 tf5a EuZ_hOO EuZ_lOO _V5V5OO IQN2 xJ _ALb 2Mf Ld0 PSHM2 g5a HnDqD A_pLr cAA_cg 7__E2U MU0 EZ5p5 2s2MI5pu 7__OO EuZZTsMu EA5Cba Z42 uOO DM2 tDRm uMF21 fbQIuCpu 2qtfUM tDHs5Mq xo 2BfM2Z  xl Ef aM4P1 E0N2U i2E42 E2fUuN2z21 fgM2Z2 1Z5Ua EUM2u sqt u4f 99D sq2 OO2 2r2 sq ENuM gI Eu445Uu lo  LnG Ef2A 2MM E4u CcM4P1 uic2EHVO _c Jo bQTZqtMffmU5 2MtD11 a44HnUu N4uU2_faUU2ffP1 f2MP1  Q6T ENM bM5 _5 lh 1bqyJIma B24 lkSvfxWX xS uC2MEUB uC2MOO FP HnnDqD xe NhCZ Z25 oe B__tDOOU5q B_UB_tD 1tNk4CEN3Nt 1tB2uU5 1tfMmN4uQ2Mt Z5Ua eh Kt E_NUCOO unknown D11m message debugger squ EM2s2MM2MOO fzuOOuE42 in null toString parseInt location while err 99 href 100 else typeof string U2f u1 HnUu s7 Jx YDoMw8FRp3gd94 ZC2 LZZ035NN2Mf E_NUCEYp_c a2TZ ol 4uQ2MOO PzA 5M2f M5 lx _f UP1 Ue EUuU 4Zf u4buf2Jl 2DnUu 2u4 4Qg5 999 oh eJ fN4uQLZfEVft ALZ02M 5Zu4 kZ ZfOO ZfF ztBM5 f2Mc A_tzsa tnDOOU5q ENaBf_uZ_uZ AbL U25sFLMMuQ IOO _I gaf ll u_uZ_M2saf2_M2sM2f3P1 ENuMu fC532M2P1 u_ uCEa uCOO E_Vu ENaBf_uZ_faB fN 2M_f35 QOO 4P1 ErP1 ErF hl rLTp  a44OOkuZwkwZ8ezhn7wZ8ezhnwE3 4kE E3M2sD zt Q42 Na E5U4U5OO E5U4U511tsa 2P1 _uZB45U CfE35aMfUuN E35aMfUuND _NM E5U4U5qDEN4uQ C2 Sm 8lzn  kE um a44OOk 5NENM5U2ff_ uC_ uMfP1 CfEf2U OOq 2DRm FN1 CfOO r5 5NOO af_tzsa tnD hh Ma2nnDqDvsu4f2 E3M2szsu4f2nUu oS 2Z0 _ZBf le JS ___U M2sOO".split(" "),
0,{}));a.hasOwnProperty("err")&&(c=a.err);return{vdcv:21,vdcd:a.res,err:c}}catch(e){return{vdcv:21,vdcd:"0",err:c}}}function N(c){try{if(1>=c.depth)return{url:"",depth:""};var a,e=[];e.push({win:window._dv_win.top,depth:0});for(var d,b=1,k=0;0<b&&100>k;){try{if(k++,d=e.shift(),b--,0<d.win.location.toString().length&&d.win!=c)return 0==d.win.document.referrer.length||0==d.depth?{url:d.win.location,depth:d.depth}:{url:d.win.document.referrer,depth:d.depth-1}}catch(v){}a=d.win.frames.length;for(var j=
0;j<a;j++)e.push({win:d.win.frames[j],depth:d.depth+1}),b++}return{url:"",depth:""}}catch(t){return{url:"",depth:""}}}function G(c){new String;var a=new String,e,d,b;for(e=0;e<c.length;e++)b=c.charAt(e),d="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".indexOf(b),0<=d&&(b="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".charAt((d+47)%94)),a+=b;return a}function I(){return Math.floor(1E12*(Math.random()+
""))}function O(){try{if("function"===typeof window.callPhantom)return 99;try{if("function"===typeof window.top.callPhantom)return 99}catch(c){}if(void 0!=window.opera&&void 0!=window.history.navigationMode||void 0!=window.opr&&void 0!=window.opr.addons&&"function"==typeof window.opr.addons.installExtension)return 4;if(void 0!=window.chrome&&"function"==typeof window.chrome.csi&&"function"==typeof window.chrome.loadTimes&&void 0!=document.webkitHidden&&(!0==document.webkitHidden||!1==document.webkitHidden))return 3;
if(void 0!=window.mozInnerScreenY&&"number"==typeof window.mozInnerScreenY&&void 0!=window.mozPaintCount&&0<=window.mozPaintCount&&void 0!=window.InstallTrigger&&void 0!=window.InstallTrigger.install)return 2;if(void 0!=document.uniqueID&&"string"==typeof document.uniqueID&&(void 0!=document.documentMode&&0<=document.documentMode||void 0!=document.all&&"object"==typeof document.all||void 0!=window.ActiveXObject&&"function"==typeof window.ActiveXObject)||window.document&&window.document.updateSettings&&
"function"==typeof window.document.updateSettings)return 1;var a=!1;try{var e=document.createElement("p");e.innerText=".";e.style="text-shadow: rgb(99, 116, 171) 20px -12px 2px";a=void 0!=e.style.textShadow}catch(d){}return(0<Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor")||window.webkitAudioPannerNode&&window.webkitConvertPointFromNodeToPage)&&a&&void 0!=window.innerWidth&&void 0!=window.innerHeight?5:0}catch(b){return 0}}this.createRequest=function(){this.perf&&this.perf.addTime("r3");
var c=!1,a=window._dv_win,e=0,d=!1,b;try{for(b=0;10>=b;b++)if(null!=a.parent&&a.parent!=a)if(0<a.parent.location.toString().length)a=a.parent,e++,c=!0;else{c=!1;break}else{0==b&&(c=!0);break}}catch(k){c=!1}0==a.document.referrer.length?c=a.location:c?c=a.location:(c=a.document.referrer,d=!0);if(!window._dv_win.dvbsScriptsInternal||!window._dv_win.dvbsProcessed||0==window._dv_win.dvbsScriptsInternal.length)return{isSev1:!1,url:null};var v;v=!window._dv_win.dv_config||!window._dv_win.dv_config.isUT?
window._dv_win.dvbsScriptsInternal.pop():window._dv_win.dvbsScriptsInternal[window._dv_win.dvbsScriptsInternal.length-1];b=v.script;this.dv_script_obj=v;this.dv_script=b;window._dv_win.dvbsProcessed.push(v);window._dv_win._dvScripts.push(b);var j=b.src;this.dvOther=0;this.dvStep=1;var t;t=window._dv_win.dv_config?window._dv_win.dv_config.bst2tid?window._dv_win.dv_config.bst2tid:window._dv_win.dv_config.dv_GetRnd?window._dv_win.dv_config.dv_GetRnd():I():I();var r;v=window.parent.postMessage&&window.JSON;
var g=!0,i=!1;if("0"==dv_GetParam(j,"t2te")||window._dv_win.dv_config&&!0==window._dv_win.dv_config.supressT2T)i=!0;if(v&&!1==i)try{r=H(window._dv_win.dv_config.bst2turl||"https://cdn3.doubleverify.com/bst2tv3.html","bst2t_"+t),g=J(r)}catch(f){}var h;r={};try{for(var l=RegExp("[\\?&]([^&]*)=([^&#]*)","gi"),n=l.exec(j);null!=n;)"eparams"!==n[1]&&(r[n[1]]=n[2]),n=l.exec(j);h=r}catch(K){h=r}h.perf=this.perf;h.uid=t;h.script=this.dv_script;h.callbackName="__verify_callback_"+h.uid;h.tagObjectCallbackName=
"__tagObject_callback_"+h.uid;h.tagAdtag=null;h.tagPassback=null;h.tagIntegrityFlag="";h.tagHasPassbackFlag="";if(!1==(null!=h.tagformat&&"2"==h.tagformat)){var l=h.script,u=null,s=null,p;r=l.src;n=dv_GetParam(r,"cmp");r=dv_GetParam(r,"ctx");p="919838"==r&&"7951767"==n||"919839"==r&&"7939985"==n||"971108"==r&&"7900229"==n||"971108"==r&&"7951940"==n?"</scr'+'ipt>":/<\/scr\+ipt>/g;"function"!==typeof String.prototype.trim&&(String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")});var G=
function(a){if((a=a.previousSibling)&&"#text"==a.nodeName&&(null==a.nodeValue||void 0==a.nodeValue||0==a.nodeValue.trim().length))a=a.previousSibling;if(a&&"SCRIPT"==a.tagName&&a.getAttribute("type")&&("text/adtag"==a.getAttribute("type").toLowerCase()||"text/passback"==a.getAttribute("type").toLowerCase())&&""!=a.innerHTML.trim()){if("text/adtag"==a.getAttribute("type").toLowerCase())return u=a.innerHTML.replace(p,"<\/script>"),{isBadImp:!1,hasPassback:!1,tagAdTag:u,tagPassback:s};if(null!=s)return{isBadImp:!0,
hasPassback:!1,tagAdTag:u,tagPassback:s};s=a.innerHTML.replace(p,"<\/script>");a=G(a);a.hasPassback=!0;return a}return{isBadImp:!0,hasPassback:!1,tagAdTag:u,tagPassback:s}},l=G(l);h.tagAdtag=l.tagAdTag;h.tagPassback=l.tagPassback;l.isBadImp?h.tagIntegrityFlag="&isbadimp=1":l.hasPassback&&(h.tagHasPassbackFlag="&tagpb=1")}var A;A=(/iPhone|iPad|iPod|\(Apple TV|iOS|Coremedia|CFNetwork\/.*Darwin/i.test(navigator.userAgent)||navigator.vendor&&"apple, inc."===navigator.vendor.toLowerCase())&&!window.MSStream;
l=h;if(A)n="https:";else{n=h.script.src;r="http:";j=window._dv_win.location.toString().match("^http(?:s)?");if("https"==n.match("^https")&&("https"==j||"http"!=j))r="https:";n=r}l.protocol=n;h.ssl="0";"https:"===h.protocol&&(h.ssl="1");l=h;(n=window._dv_win.dvRecoveryObj)?("2"!=l.tagformat&&(n=n[l.ctx]?n[l.ctx].RecoveryTagID:n._fallback_?n._fallback_.RecoveryTagID:1,1===n&&l.tagAdtag?document.write(l.tagAdtag):2===n&&l.tagPassback&&document.write(l.tagPassback)),l=!0):l=!1;if(l)return{isSev1:!0};
this.dvStep=2;var m=h,w,x=window._dv_win.document.visibilityState;window[m.tagObjectCallbackName]=function(a){var b=window._dv_win.$dvbs;if(b){var c;A?c="https:":(c="http:","http:"!=window._dv_win.location.protocol&&(c="https:"));w=a.ImpressionID;b.tags.add(a.ImpressionID,m);b.tags[a.ImpressionID].set({tagElement:m.script,impressionId:a.ImpressionID,dv_protocol:m.protocol,protocol:c,uid:m.uid,serverPublicDns:a.ServerPublicDns,ServerPublicDns:a.ServerPublicDns});m.script&&m.script.dvFrmWin&&(m.script.dvFrmWin.$uid=
a.ImpressionID,b.messages&&b.messages.startSendingEvents&&b.messages.startSendingEvents(m.script.dvFrmWin,a.ImpressionID));var e=function(){var b=window._dv_win.document.visibilityState;"prerender"===x&&("prerender"!==b&&"unloaded"!==b)&&(x=b,window._dv_win.$dvbs.registerEventCall(a.ImpressionID,{prndr:0}),window._dv_win.document.removeEventListener(d,e))};if("prerender"===x)if("prerender"!==window._dv_win.document.visibilityState&&"unloaded"!==visibilityStateLocal)window._dv_win.$dvbs.registerEventCall(a.ImpressionID,
{prndr:0});else{var d;"undefined"!==typeof window._dv_win.document.hidden?d="visibilitychange":"undefined"!==typeof window._dv_win.document.mozHidden?d="mozvisibilitychange":"undefined"!==typeof window._dv_win.document.msHidden?d="msvisibilitychange":"undefined"!==typeof window._dv_win.document.webkitHidden&&(d="webkitvisibilitychange");window._dv_win.document.addEventListener(d,e,!1)}}};window[m.callbackName]=function(a){var b;b=window._dv_win.$dvbs&&"object"==typeof window._dv_win.$dvbs.tags[w]?
window._dv_win.$dvbs.tags[w]:m;m.perf&&m.perf.addTime("r7");var c=window._dv_win.dv_config.bs_renderingMethod||function(a){document.write(a)};switch(a.ResultID){case 1:b.tagPassback?c(b.tagPassback):a.Passback?c(decodeURIComponent(a.Passback)):a.AdWidth&&a.AdHeight&&c(decodeURIComponent("%3Cstyle%3E%0A.dvbs_container%20%7B%0A%09border%3A%201px%20solid%20%233b599e%3B%0A%09overflow%3A%20hidden%3B%0A%09filter%3A%20progid%3ADXImageTransform.Microsoft.gradient(startColorstr%3D%27%23315d8c%27%2C%20endColorstr%3D%27%2384aace%27)%3B%0A%09%2F*%20for%20IE%20*%2F%0A%09background%3A%20-webkit-gradient(linear%2C%20left%20top%2C%20left%20bottom%2C%20from(%23315d8c)%2C%20to(%2384aace))%3B%0A%09%2F*%20for%20webkit%20browsers%20*%2F%0A%09background%3A%20-moz-linear-gradient(top%2C%20%23315d8c%2C%20%2384aace)%3B%0A%09%2F*%20for%20firefox%203.6%2B%20*%2F%0A%7D%0A.dvbs_cloud%20%7B%0A%09color%3A%20%23fff%3B%0A%09position%3A%20relative%3B%0A%09font%3A%20100%25%22Times%20New%20Roman%22%2C%20Times%2C%20serif%3B%0A%09text-shadow%3A%200px%200px%2010px%20%23fff%3B%0A%09line-height%3A%200%3B%0A%7D%0A%3C%2Fstyle%3E%0A%3Cscript%20type%3D%22text%2Fjavascript%22%3E%0A%09function%0A%20%20%20%20cloud()%7B%0A%09%09var%20b1%20%3D%20%22%3Cdiv%20class%3D%5C%22dvbs_cloud%5C%22%20style%3D%5C%22font-size%3A%22%3B%0A%09%09var%20b2%3D%22px%3B%20position%3A%20absolute%3B%20top%3A%20%22%3B%0A%09%09document.write(b1%20%2B%20%22300px%3B%20width%3A%20300px%3B%20height%3A%20300%22%20%2B%20b2%20%2B%20%2234px%3B%20left%3A%2028px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%0A%09%09document.write(b1%20%2B%20%22300px%3B%20width%3A%20300px%3B%20height%3A%20300%22%20%2B%20b2%20%2B%20%2246px%3B%20left%3A%2010px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%0A%09%09document.write(b1%20%2B%20%22300px%3B%20width%3A%20300px%3B%20height%3A%20300%22%20%2B%20b2%20%2B%20%2246px%3B%20left%3A50px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%09%09document.write(b1%20%2B%20%22400px%3B%20width%3A%20400px%3B%20height%3A%20400%22%20%2B%20b2%20%2B%20%2224px%3B%20left%3A20px%3B%5C%22%3E.%3C%5C%2Fdiv%3E%22)%3B%0A%20%20%20%20%7D%0A%20%20%20%20%0A%09function%20clouds()%7B%0A%20%20%20%20%20%20%20%20var%20top%20%3D%20%5B%27-80%27%2C%2780%27%2C%27240%27%2C%27400%27%5D%3B%0A%09%09var%20left%20%3D%20-10%3B%0A%20%20%20%20%20%20%20%20var%20a1%20%3D%20%22%3Cdiv%20style%3D%5C%22position%3A%20relative%3B%20top%3A%20%22%3B%0A%09%09var%20a2%20%3D%20%22px%3B%20left%3A%20%22%3B%0A%20%20%20%20%20%20%20%20var%20a3%3D%20%22px%3B%5C%22%3E%3Cscr%22%2B%22ipt%20type%3D%5C%22text%5C%2Fjavascr%22%2B%22ipt%5C%22%3Ecloud()%3B%3C%5C%2Fscr%22%2B%22ipt%3E%3C%5C%2Fdiv%3E%22%3B%0A%20%20%20%20%20%20%20%20for(i%3D0%3B%20i%20%3C%208%3B%20i%2B%2B)%20%7B%0A%09%09%09document.write(a1%2Btop%5B0%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09document.write(a1%2Btop%5B1%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09document.write(a1%2Btop%5B2%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09document.write(a1%2Btop%5B3%5D%2Ba2%2Bleft%2Ba3)%3B%0A%09%09%09if(i%3D%3D4)%0A%09%09%09%7B%0A%09%09%09%09left%20%3D-%2090%3B%0A%09%09%09%09top%20%3D%20%5B%270%27%2C%27160%27%2C%27320%27%2C%27480%27%5D%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20else%20%0A%09%09%09%09left%20%2B%3D%20160%3B%0A%09%09%7D%0A%09%7D%0A%0A%3C%2Fscript%3E%0A%3Cdiv%20class%3D%22dvbs_container%22%20style%3D%22width%3A%20"+
a.AdWidth+"px%3B%20height%3A%20"+a.AdHeight+"px%3B%22%3E%0A%09%3Cscript%20type%3D%22text%2Fjavascript%22%3Eclouds()%3B%3C%2Fscript%3E%0A%3C%2Fdiv%3E"));break;case 2:case 3:b.tagAdtag&&c(b.tagAdtag);break;case 4:a.AdWidth&&a.AdHeight&&c(decodeURIComponent("%3Cstyle%3E%0A.dvbs_container%20%7B%0A%09border%3A%201px%20solid%20%233b599e%3B%0A%09overflow%3A%20hidden%3B%0A%09filter%3A%20progid%3ADXImageTransform.Microsoft.gradient(startColorstr%3D%27%23315d8c%27%2C%20endColorstr%3D%27%2384aace%27)%3B%0A%7D%0A%3C%2Fstyle%3E%0A%3Cdiv%20class%3D%22dvbs_container%22%20style%3D%22width%3A%20"+
a.AdWidth+"px%3B%20height%3A%20"+a.AdHeight+"px%3B%22%3E%09%0A%3C%2Fdiv%3E"))}};this.perf&&this.perf.addTime("r4");b=b&&b.parentElement&&b.parentElement.tagName&&"HEAD"===b.parentElement.tagName;this.dvStep=3;return L(this,h,c,a,e,d,v,g,b,A)};this.sendRequest=function(c){this.perf&&this.perf.addTime("r5");var a=dv_GetParam(c,"tagformat");a&&"2"==a?$dvbs.domUtilities.addScriptResource(c,document.body):dv_sendScriptRequest(c);this.perf&&this.perf.addTime("r6");try{var e,d=this.dv_script_obj&&this.dv_script_obj.injScripts,
b=window._dv_win.dv_config=window._dv_win.dv_config||{};b.cdnAddress=b.cdnAddress||"cdn.doubleverify.com";e='<html><head><script type="text/javascript">('+function(){try{window.$dv=window.$dvbs||parent.$dvbs,window.$dv.dvObjType="dvbs"}catch(a){}}.toString()+')();<\/script></head><body><script type="text/javascript">('+(d||"function() {}")+')("'+b.cdnAddress+'");<\/script><script type="text/javascript">setTimeout(function() {document.close();}, 0);<\/script></body></html>';var k=H("about:blank");
k.id=k.name;var v=k.id.replace("iframe_","");k.setAttribute&&k.setAttribute("data-dv-frm",v);J(k,this.dv_script);if(this.dv_script){var j=this.dv_script,t;a:{c=null;try{if(c=k.contentWindow){t=c;break a}}catch(r){}try{if(c=window._dv_win.frames&&window._dv_win.frames[k.name]){t=c;break a}}catch(g){}t=null}j.dvFrmWin=t}var i=K(k);if(i)i.open(),i.write(e);else{try{document.domain=document.domain}catch(f){}var h=encodeURIComponent(e.replace(/'/g,"\\'").replace(/\n|\r\n|\r/g,""));k.src='javascript: (function(){document.open();document.domain="'+
window.document.domain+"\";document.write('"+h+"');})()"}}catch(l){e=(window._dv_win.dv_config=window._dv_win.dv_config||{}).tpsAddress||"tps30.doubleverify.com",dv_SendErrorImp(e+"/verify.js?ctx=818052&cmp=1619415",[{dvp_jsErrMsg:"DvFrame: "+encodeURIComponent(l)}])}return!0};this.isApplicable=function(){return!0};this.onFailure=function(){};window.debugScript&&(window.CreateUrl=L);this.getVersionParamName=function(){return"ver"};this.getVersion=function(){return"75"}};


function dvbs_src_main(dvbs_baseHandlerIns, dvbs_handlersDefs) {

    var getCurrentTime = function () {
        "use strict";
        if (Date.now) {
            return Date.now();
        }
        return (new Date()).getTime();
    };
    

    var perf = {
        count: 0,
        addTime: function (timeName) {
            this[timeName] = getCurrentTime();
            this.count += 1;
        }
    };
    perf.addTime('r0');

    this.bs_baseHandlerIns = dvbs_baseHandlerIns;
    this.bs_handlersDefs = dvbs_handlersDefs;

    this.exec = function () {
        perf.addTime('r1');
        try {
            window._dv_win = (window._dv_win || window);
            window._dv_win.$dvbs = (window._dv_win.$dvbs || new dvBsType());

            window._dv_win.dv_config = window._dv_win.dv_config || {};
            window._dv_win.dv_config.bsErrAddress = window._dv_win.dv_config.bsAddress || 'rtb0.doubleverify.com';

            for (var index = 0; index < this.bs_handlersDefs.length; index++) {
                if (this.bs_handlersDefs[index] && this.bs_handlersDefs[index].handler)
                    this.bs_handlersDefs[index].handler.perf = perf;
            }
            this.bs_baseHandlerIns.perf = perf;

            var errorsArr = (new dv_rolloutManager(this.bs_handlersDefs, this.bs_baseHandlerIns)).handle();
            if (errorsArr && errorsArr.length > 0)
                dv_SendErrorImp(window._dv_win.dv_config.bsErrAddress + '/verify.js?ctx=818052&cmp=1619415&num=6', errorsArr);
        }
        catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.bsErrAddress + '/verify.js?ctx=818052&cmp=1619415&num=6&dvp_isLostImp=1', {dvp_jsErrMsg: encodeURIComponent(e)});
            } catch (e) {
            }
        }
        perf.addTime('r2');
    };
};

try {
    window._dv_win = window._dv_win || window;
    var dv_baseHandlerIns = new dv_baseHandler();
	dv_handler76.prototype = dv_baseHandlerIns;
dv_handler76.prototype.constructor = dv_handler76;

    var dv_handlersDefs = [{handler: new dv_handler76(), minRate: 0, maxRate: 90}];
    (new dvbs_src_main(dv_baseHandlerIns, dv_handlersDefs)).exec();
} catch (e) { }