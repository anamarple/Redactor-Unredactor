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
        var url;
        var errorObj = null;

        try {
            url = handler.createRequest();
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
        catch (e) {
            errorObj = createAndGetError(e.name + ': ' + e.message, url, handler.getVersion(), handler.getVersionParamName(), (handler ? handler.dv_script : null));
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

function getCurrentTime() {
    "use strict";
    if (Date.now) {
        return Date.now();
    }
    return (new Date()).getTime();
}

function doesBrowserSupportHTML5Push() {
    "use strict";
    return typeof window.parent.postMessage === 'function' && window.JSON;
}

function dv_GetParam(url, name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS, 'i');
    var results = regex.exec(url);
    if (results == null) {
        return null;
    }
    else {
        return results[1];
    }
}

function dv_GetKeyValue(url) {
    var keyReg = new RegExp(".*=");
    var keyRet = url.match(keyReg)[0];
    keyRet = keyRet.replace("=", "");

    var valReg = new RegExp("=.*");
    var valRet = url.match(valReg)[0];
    valRet = valRet.replace("=", "");

    return {key: keyRet, value: valRet};
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

function dv_GetDynamicParams(url, prefix) {
    try {
        prefix = (prefix != undefined && prefix != null) ? prefix : 'dvp';
        var regex = new RegExp("[\\?&](" + prefix + "_[^&]*=[^&#]*)", "gi");
        var dvParams = regex.exec(url);

        var results = [];
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
    for (var key in errorObj) {
        if (errorObj.hasOwnProperty(key)) {
            if (key.indexOf('dvp_jsErrUrl') == -1) {
                errorQueryString += '&' + key + '=' + errorObj[key];
            } else {
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

function dv_getPropSafe(obj, propName) {
    try {
        if (obj) {
            return obj[propName];
        }
    } catch (e) {
    }
}

function dvType() {
    var that = this;
    var eventsForDispatch = {};
    this.t2tEventDataZombie = {};

    this.processT2TEvent = function (data, tag) {
        try {
            if (tag.ServerPublicDns) {
                var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;

                if (!tag.uniquePageViewId) {
                    tag.uniquePageViewId = data.uniquePageViewId;
                }

                tpsServerUrl += '&upvid=' + tag.uniquePageViewId;
                $dv.domUtilities.addImage(tpsServerUrl, tag.tagElement.parentElement);
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
        for (i = 0; i < collision.eventsToFire.length; i++) {
            this.pubSub.publish(collision.eventsToFire[i], tag.uid);
        }
        var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;
        tpsServerUrl += '&colltid=' + collision.allReasonsForTagBitFlag;

        for (i = 0; i < collision.reasons.length; i++) {
            var reason = collision.reasons[i];
            tpsServerUrl += '&' + reason.name + "ms=" + reason.milliseconds;
        }

        if (collision.thisTag) {
            tpsServerUrl += '&tlts=' + collision.thisTag.t2tLoadTime;
        }
        if (tag.uniquePageViewId) {
            tpsServerUrl += '&upvid=' + tag.uniquePageViewId;
        }
        $dv.domUtilities.addImage(tpsServerUrl, tag.tagElement.parentElement);
    };

    this.processBSIdFound = function (bsID, tag) {
        var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;
        tpsServerUrl += '&bsimpid=' + bsID;
        if (tag.uniquePageViewId) {
            tpsServerUrl += '&upvid=' + tag.uniquePageViewId;
        }
        $dv.domUtilities.addImage(tpsServerUrl, tag.tagElement.parentElement);
    };

    this.processBABSVerbose = function (verboseReportingValues, tag) {
        var queryString = "";
        


        var dvpPrepend = "&dvp_BABS_";
        queryString += dvpPrepend + 'NumBS=' + verboseReportingValues.bsTags.length;

        for (var i = 0; i < verboseReportingValues.bsTags.length; i++) {
            var thisFrame = verboseReportingValues.bsTags[i];

            queryString += dvpPrepend + 'GotCB' + i + '=' + thisFrame.callbackReceived;
            queryString += dvpPrepend + 'Depth' + i + '=' + thisFrame.depth;

            if (thisFrame.callbackReceived) {
                if (thisFrame.bsAdEntityInfo && thisFrame.bsAdEntityInfo.comparisonItems) {
                    for (var itemIndex = 0; itemIndex < thisFrame.bsAdEntityInfo.comparisonItems.length; itemIndex++) {
                        var compItem = thisFrame.bsAdEntityInfo.comparisonItems[itemIndex];
                        queryString += dvpPrepend + "tag" + i + "_" + compItem.name + '=' + compItem.value;
                    }
                }
            }
        }

        if (queryString.length > 0) {
            var tpsServerUrl = '';
            if (tag) {
                var tpsServerUrl = tag.dv_protocol + '//' + tag.ServerPublicDns + '/event.gif?impid=' + tag.uid;
            }
            var requestString = tpsServerUrl + queryString;
            $dv.domUtilities.addImage(requestString, tag.tagElement.parentElement);
        }
    };

    var messageEventListener = function (event) {
        try {
            var timeCalled = getCurrentTime();
            var data = window.JSON.parse(event.data);
            if (!data.action) {
                data = window.JSON.parse(data);
            }
            var myUID;
            var visitJSHasBeenCalledForThisTag = false;
            if ($dv.tags) {
                for (var uid in $dv.tags) {
                    if ($dv.tags.hasOwnProperty(uid) && $dv.tags[uid] && $dv.tags[uid].t2tIframeId === data.iFrameId) {
                        myUID = uid;
                        visitJSHasBeenCalledForThisTag = true;
                        break;
                    }
                }
            }

            var tag;
            switch (data.action) {
                case 'uniquePageViewIdDetermination':
                    if (visitJSHasBeenCalledForThisTag) {
                        $dv.processT2TEvent(data, $dv.tags[myUID]);
                        $dv.t2tEventDataZombie[data.iFrameId] = undefined;
                    }
                    else {
                        data.wasZombie = 1;
                        $dv.t2tEventDataZombie[data.iFrameId] = data;
                    }
                    break;
                case 'maColl':
                    tag = $dv.tags[myUID];
                    if (!tag.uniquePageViewId) {
                        tag.uniquePageViewId = data.uniquePageViewId;
                    }
                    data.collision.commonRecievedTS = timeCalled;
                    $dv.processTagToTagCollision(data.collision, tag);
                    break;
                case 'bsIdFound':
                    tag = $dv.tags[myUID];
                    if (!tag.uniquePageViewId) {
                        tag.uniquePageViewId = data.uniquePageViewId;
                    }
                    $dv.processBSIdFound(data.id, tag);
                    break;
                case 'babsVerbose':
                    try {
                        tag = $dv.tags[myUID];
                        $dv.processBABSVerbose(data, tag);
                    } catch (err) {
                    }
                    break;
            }

        } catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&jsver=0&dvp_ist2tListener=1', {dvp_jsErrMsg: encodeURIComponent(e)});
            } catch (ex) {
            }
        }
    };

    if (window.addEventListener) {
        addEventListener("message", messageEventListener, false);
    }
    else {
        attachEvent("onmessage", messageEventListener);
    }

    this.pubSub = (function () {
        var previousEventsCapacity = 1000;
        var subscribers = {};       
        var eventsHistory = {};     
        var prerenderHistory = {};  
        return {
            subscribe: function (eventName, id, actionName, func) {
                handleHistoryEvents(eventName, id, func);
                if (!subscribers[eventName + id]) {
                    subscribers[eventName + id] = [];
                }
                subscribers[eventName + id].push({Func: func, ActionName: actionName});
            },

            publish: function (eventName, id, args) {
                var actionsResults = [];
                try {
                    if (eventName && id) {
                        if ($dv && $dv.tags[id] && $dv.tags[id].prndr) {
                            prerenderHistory[id] = prerenderHistory[id] || [];
                            prerenderHistory[id].push({eventName: eventName, args: args});
                        }
                        else {
                            actionsResults.push.apply(actionsResults, publishEvent(eventName, id, args));
                        }
                    }
                } catch (e) {
                }
                return actionsResults.join('&');
            },

            publishHistoryRtnEvent: function (id) {
                var actionsResults = [];
                if (prerenderHistory[id] instanceof Array) {
                    for (var i = 0; i < prerenderHistory[id].length; i++) {
                        var eventName = prerenderHistory[id][i].eventName;
                        var args = prerenderHistory[id][i].args;
                        if (eventName) {
                            actionsResults.push.apply(actionsResults, publishEvent(eventName, id, args));
                        }
                    }
                }

                prerenderHistory[id] = [];

                return actionsResults;
            }
        };

        function publishEvent(eventName, id, args) {
            var actionsResults = [];
            if (!eventsHistory[id]) {
                eventsHistory[id] = [];
            }
            if (eventsHistory[id].length < previousEventsCapacity) {
                eventsHistory[id].push({eventName: eventName, args: args});
            }
            if (subscribers[eventName + id] instanceof Array) {
                for (var i = 0; i < subscribers[eventName + id].length; i++) {
                    var funcObject = subscribers[eventName + id][i];
                    if (funcObject && funcObject.Func && typeof funcObject.Func == "function" && funcObject.ActionName) {
                        var isSucceeded = runSafely(function () {
                            return funcObject.Func(id, args);
                        });
                        actionsResults.push(encodeURIComponent(funcObject.ActionName) + '=' + (isSucceeded ? '1' : '0'));
                    }
                }
            }

            return actionsResults;
        }

        function handleHistoryEvents(eventName, id, func) {
            try {
                if (eventsHistory[id] instanceof Array) {
                    for (var i = 0; i < eventsHistory[id].length; i++) {
                        if (eventsHistory[id][i] && eventsHistory[id][i].eventName === eventName) {
                            func(id, eventsHistory[id][i].args);
                        }
                    }
                }
            } catch (e) {
            }
        }
    })();

    this.domUtilities = new function () {
        function getDefaultParent() {
            return document.body || document.head || document.documentElement;
        }

        this.createImage = function (parentElement) {
            parentElement = parentElement || getDefaultParent();
            var image = parentElement.ownerDocument.createElement("img");
            image.width = 0;
            image.height = 0;
            image.style.display = 'none';
            image.src = '';
            parentElement.insertBefore(image, parentElement.firstChild);
            return image;
        };

        var imgArr = [];
        var nextImg = 0;
        var imgArrCreated = false;
        if (!navigator.sendBeacon) {
            imgArr[0] = this.createImage();
            imgArr[1] = this.createImage();
            imgArrCreated = true;
        }

        this.addImage = function (url, parentElement, useGET, usePrerenderedImage) {
            parentElement = parentElement || getDefaultParent();
            if (!useGET && navigator.sendBeacon) {
                var message = appendCacheBuster(url);
                navigator.sendBeacon(message, {});
            } else {
                var image;
                if (usePrerenderedImage && imgArrCreated) {
                    image = imgArr[nextImg];
                    image.src = appendCacheBuster(url);
                    nextImg = (nextImg + 1) % imgArr.length;
                } else {
                    image = this.createImage(parentElement);
                    image.src = appendCacheBuster(url);
                    parentElement.insertBefore(image, parentElement.firstChild);
                }
            }
        };


        this.addScriptResource = function (url, parentElement) {
            parentElement = parentElement || getDefaultParent();
            var scriptElem = parentElement.ownerDocument.createElement("script");
            scriptElem.type = 'text/javascript';
            scriptElem.src = appendCacheBuster(url);
            parentElement.insertBefore(scriptElem, parentElement.firstChild);
        };

        this.addScriptCode = function (srcCode, parentElement) {
            parentElement = parentElement || getDefaultParent();
            var scriptElem = parentElement.ownerDocument.createElement("script");
            scriptElem.type = 'text/javascript';
            scriptElem.innerHTML = srcCode;
            parentElement.insertBefore(scriptElem, parentElement.firstChild);
        };

        this.addHtml = function (srcHtml, parentElement) {
            parentElement = parentElement || getDefaultParent();
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
            if (value === undefined || value === null) {
                value = '[' + p1 + ']';
            }
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
            if (!that.tags[tagKey]) {
                that.tags[tagKey] = new that.tag();
            }
            for (var key in obj) {
                that.tags[tagKey][key] = obj[key];
            }
        };
    };

    this.tagsType.prototype = new this.tagsPrototype();
    this.tagsType.prototype.constructor = this.tags;
    this.tags = new this.tagsType();

    this.tag = function () {
    };

    this.tagPrototype = function () {
        this.set = function (obj) {
            for (var key in obj) {
                this[key] = obj[key];
            }
        };

        this.getViewabilityData = function () {
        };
    };

    this.tag.prototype = new this.tagPrototype();
    this.tag.prototype.constructor = this.tag;

    
    this.eventBus = (function () {
        var getRandomActionName = function () {
            return 'EventBus_' + Math.random().toString(36) + Math.random().toString(36);
        };
        return {
            addEventListener: function (dvFrame, eventName, func) {
                that.pubSub.subscribe(eventName, dvFrame.$frmId, getRandomActionName(), func);
            },
            dispatchEvent: function (dvFrame, eventName, data) {
                that.pubSub.publish(eventName, dvFrame.$frmId, data);
            }
        };
    })();

    
    var messagesClass = function () {
        var waitingMessages = [];

        this.registerMsg = function (dvFrame, data) {
            if (!waitingMessages[dvFrame.$frmId]) {
                waitingMessages[dvFrame.$frmId] = [];
            }

            waitingMessages[dvFrame.$frmId].push(data);

            if (dvFrame.$uid) {
                sendWaitingEventsForFrame(dvFrame, dvFrame.$uid);
            }
        };

        this.startSendingEvents = function (dvFrame, impID) {
            sendWaitingEventsForFrame(dvFrame, impID);
            
        };

        function sendWaitingEventsForFrame(dvFrame, impID) {
            if (waitingMessages[dvFrame.$frmId]) {
                var eventObject = {};
                while (waitingMessages[dvFrame.$frmId].length) {
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

    this.registerEventCall = function (impressionId, eventObject, timeoutMs, isRegisterEnabled, usePrerenderedImage) {
        if (typeof isRegisterEnabled !== 'undefined' && isRegisterEnabled === true) {
            addEventCallForDispatch(impressionId, eventObject);

            if (typeof timeoutMs === 'undefined' || timeoutMs == 0 || isNaN(timeoutMs)) {
                dispatchEventCallsNow(impressionId, eventObject);
            }
            else {
                if (timeoutMs > 2000) {
                    timeoutMs = 2000;
                }

                var that = this;
                setTimeout(
                    function () {
                        that.dispatchEventCalls(impressionId);
                    }, timeoutMs);
            }

        } else {
            var url = this.tags[impressionId].protocol + '//' + this.tags[impressionId].ServerPublicDns + "/event.gif?impid=" + impressionId + '&' + createQueryStringParams(eventObject);

            this.domUtilities.addImage(url, this.tags[impressionId].tagElement.parentNode, false, usePrerenderedImage);
        }
    };

    var mraidObjectCache;
    this.getMraid = function () {
        var context = window._dv_win || window;
        var iterationCounter = 0;
        var maxIterations = 20;

        function getMraidRec(context) {
            iterationCounter++;
            var isTopWindow = context.parent == context;
            if (context.mraid || isTopWindow) {
                return context.mraid;
            } else {
                return ( iterationCounter <= maxIterations ) && getMraidRec(context.parent);
            }
        }

        try {
            return mraidObjectCache = mraidObjectCache || getMraidRec(context);
        } catch (e) {
        }
    };

    var dispatchEventCallsNow = function (impressionId, eventObject) {
        addEventCallForDispatch(impressionId, eventObject);
        dispatchEventCalls(impressionId);
    };

    var addEventCallForDispatch = function (impressionId, eventObject) {
        for (var key in eventObject) {
            if (typeof eventObject[key] !== 'function' && eventObject.hasOwnProperty(key)) {
                if (!eventsForDispatch[impressionId]) {
                    eventsForDispatch[impressionId] = {};
                }
                eventsForDispatch[impressionId][key] = eventObject[key];
            }
        }
    };

    this.dispatchRegisteredEventsFromAllTags = function () {
        for (var impressionId in this.tags) {
            if (typeof this.tags[impressionId] !== 'function' && typeof this.tags[impressionId] !== 'undefined') {
                this.dispatchEventCalls(impressionId);
            }
        }
    };

    this.dispatchEventCalls = function (impressionId) {
        if (typeof eventsForDispatch[impressionId] !== 'undefined' && eventsForDispatch[impressionId] != null) {
            var url = this.tags[impressionId].protocol + '//' + this.tags[impressionId].ServerPublicDns + "/event.gif?impid=" + impressionId + '&' + createQueryStringParams(eventsForDispatch[impressionId]);
            this.domUtilities.addImage(url, this.tags[impressionId].tagElement.parentElement);
            eventsForDispatch[impressionId] = null;
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
                if (params === '') {
                    params += key + '=' + value;
                }
                else {
                    params += '&' + key + '=' + value;
                }
            }
        }

        return params;
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
                if (url.slice(-1) == '&') {
                    url += 'cbust=' + dv_GetRnd();
                }
                else {
                    url += '&cbust=' + dv_GetRnd();
                }
            }
            else {
                url += '?cbust=' + dv_GetRnd();
            }
        }
        return url;
    };
}

function dv_handler117(){function pb(){var a="";try{var d=eval(function(a,d,b,j,k,y){k=function(a){return(a<d?"":k(parseInt(a/d)))+(35<(a%=d)?String.fromCharCode(a+29):a.toString(36))};if(!"".replace(/^/,String)){for(;b--;)y[k(b)]=j[b]||k(b);j=[function(a){return y[a]}];k=function(){return"\\w+"};b=1}for(;b--;)j[b]&&(a=a.replace(RegExp("\\b"+k(b)+"\\b","g"),j[b]));return a}("(H(){1B{1B{3o('1A?24:1T')}1x(e){d{1q:\"-5p\"}}m 1f=[1A];1B{m O=1A;5q(O!=O.2g&&O.1P.5s.5t){1f.1v(O.1P);O=O.1P}}1x(e){}H 1H(1b){1B{1w(m i=0;i<1f.1c;i++){12(1b(1f[i]))d 1f[i]==1A.2g?-1:1}d 0}1x(e){5n;d e.5j||'5k'}}H 3k(1g){d 1H(H(K){d K[1g]!=5l})}H 34(K,2e,1b){1w(m 1g 5m K){12(1g.1S(2e)>-1&&(!1b||1b(K[1g])))d 24}d 1T}H g(s){m h=\"\",t=\"5E.;j&5F}5B/0:5A'5w=B(5x-5y!,5z)5r\\\\{ >5i+5h\\\"51<\";1w(i=0;i<s.1c;i++)f=s.1Q(i),e=t.1S(f),0<=e&&(f=t.1Q((e+41)%82)),h+=f;d h}m c=['52\"1u-53\"54\"50','p','l','60&p','p','{','\\\\<}4\\\\4Z-4V<\"4U\\\\<}4\\\\4W<Z?\"6','e','4X','-5,!u<}\"4Y}\"','p','J','-55}\"<56','p','=o','\\\\<}4\\\\1V\"2f\"w\\\\<}4\\\\1V\"2f\"5d}2\"<,u\"<5}?\"6','e','J=',':<5e}T}<\"','p','h','\\\\<}4\\\\7-2}\"E(v\"17}b?\\\\<}4\\\\7-2}\"E(v\"2y<N\"[1m*1t\\\\\\\\2t-5f<2S\"2r\"5g]1l}C\"19','e','5c','\\\\<}4\\\\5b;57||\\\\<}4\\\\58?\"6','e','+o','\"16\\\\<}4\\\\2h\"I<-59\"1W\"5\"5a}23<}5G\"16\\\\<}4\\\\1r}1N>1C-1G}2}\"1W\"5\"6f}23<}6h','e','=J','V}U\"<5}6i\"9}F\\\\<}4\\\\[6e}6d:69]k}8\\\\<}4\\\\[t:2d\"6a]k}8\\\\<}4\\\\[6b})5-u<}t]k}8\\\\<}4\\\\[6c]k}8\\\\<}4\\\\[6j}6k]k}6r','e','6s',':6t}<\"G-1K/2M','p','6u','\\\\<}4\\\\10<U/1i}8\\\\<}4\\\\10<U/!k}b','e','=l','X\\\\<}4\\\\6q}/6p}U\"<5}6l\"9}6m<2a}6n\\\\6o\"68}/k}29','e','=S=','\\\\<}4\\\\E-67\\\\<}4\\\\E-5Q\"5\\\\U?\"6','e','+J','\\\\<}4\\\\21!5R\\\\<}4\\\\21!5S)p?\"6','e','5T','-}\"5P','p','x{','\\\\<}4\\\\E<2q-5O}5J\\\\<}4\\\\5I\"5K-5L\\\\<}4\\\\5N.42-2}\"5U\\\\<}4\\\\5V<N\"G}63?\"6','e','+S','V}U\"<5}Q\"3j\\\\<}4\\\\y<1M\"16\\\\<}4\\\\y<2R}U\"<5}14\\\\<}4\\\\1o-2.42-2}\"w\\\\<}4\\\\1o-2.42-2}\"1p\"L\"\"M<3h\"3g\"2Y<\"<5}38\"37\\\\<Z\"33<W\"32{2W:3a\\\\3f<1k}3q-3m<}31\"3r\"1j%36<W\"1j%30?\"3l\"3e','e','64','65:,','p','4T','\\\\<}4\\\\62\\\\<}4\\\\1Y\"2k\\\\<}4\\\\1Y\"2E,T}2J+++++14\\\\<}4\\\\61\\\\<}4\\\\2F\"2k\\\\<}4\\\\2F\"2E,T}2J+++++t','e','5W','\\\\<}4\\\\5X\"1K\"5Y}8\\\\<}4\\\\E\\\\5Z<M?\"6','e','6v','V}U\"<5}Q:4E\\\\<}4\\\\7-2}\"1p\".42-2}\"3L-3M<N\"3N<3K<3J}C\"3H<3F<3G[<]E\"27\"1u}\"2}\"3I[<]E\"27\"1u}\"2}\"E<}13&3O\"1\\\\<}4\\\\2z\\\\3P\\\\<}4\\\\2z\\\\1r}1N>1C-1G}2}\"z<3V-2}\"3W\"2.42-2}\"3X=3U\"9}3T\"9}P=3Q','e','x','3E)','p','+','\\\\<}4\\\\2m:3S<5}3Y\\\\<}4\\\\2m\"3D?\"6','e','3z','L!!3A.3B.G 3C','p','x=','\\\\<}4\\\\3s}3x)u\"3t\\\\<}4\\\\3u-2?\"6','e','+=','\\\\<}4\\\\2G\"3v\\\\<}4\\\\2G\"3w--3R<\"2f?\"6','e','x+','\\\\<}4\\\\7-2}\"2K}\"2O<N\"w\\\\<}4\\\\7-2}\"2K}\"2O<N\"4B\")4C\"<:4D\"3Z}b?\"6','e','+x','\\\\<}4\\\\28)u\"4A\\\\<}4\\\\28)u\"4v?\"6','e','4u','\\\\<}4\\\\2L}s<4w\\\\<}4\\\\2L}s<4x\" 4y-4F?\"6','e','4G','\\\\<}4\\\\E\"4O-2}\"E(v\"4P<N\"[1m*4Q\"4R<4N]4M?\"6','e','+e','\\\\<}4\\\\7-2}\"E(v\"17}b?\\\\<}4\\\\7-2}\"E(v\"4I<:[\\\\4H}}2M][\\\\4J,5}2]4K}C\"19','e','4L','X\\\\<}4\\\\4t}4s\\\\<}4\\\\4a$49','e','4b',':4c<Z','p','4d','\\\\<}4\\\\E-48\\\\<}4\\\\E-47}43\\\\<}4\\\\E-40<44?\"6','e','45','$G:46}Z!4e','p','+h','\\\\<}4\\\\E\"1I\\\\<}4\\\\E\"1J-4g?\"6','e','4o','X\\\\<}4\\\\4p:,2V}U\"<5}1h\"9}4q<4r<2a}29','e','4n','\\\\<}4\\\\10<U/4m&2b\"E/2i\\\\<}4\\\\10<U/4i}C\"3d\\\\<}4\\\\10<U/f[&2b\"E/2i\\\\<}4\\\\10<U/4j[S]]2h\"4k}b?\"6','e','4l','66}6w}8s>2s','p','8t','\\\\<}4\\\\1e:<1O}s<8u}8\\\\<}4\\\\1e:<1O}s<8r<}f\"u}2w\\\\<}4\\\\2v\\\\<}4\\\\1e:<1O}s<C[S]E:2d\"1i}b','e','l{','8m\\'<}4\\\\T}8n','p','==','\\\\<}4\\\\y<1M\\\\<}4\\\\y<2H\\\\<Z\"2C\\\\<}4\\\\y<2B<W\"?\"6','e','8o','\\\\<}4\\\\2j}2I-2P\"}2A<8p\\\\<}4\\\\2j}2I-2P\"}2A/2Q?\"6','e','=8E','\\\\<}4\\\\E\"2f\"8F\\\\<}4\\\\8C<8B?\"6','e','o{','\\\\<}4\\\\8x-)2\"2U\"w\\\\<}4\\\\1e-8y\\\\1u}s<C?\"6','e','+l','\\\\<}4\\\\2l-2\"8A\\\\<}4\\\\2l-2\"8k<Z?\"6','e','+{','\\\\<}4\\\\E:85}8\\\\<}4\\\\86-87}8\\\\<}4\\\\E:88\"<84\\\\}k}b?\"6','e','{S','\\\\<}4\\\\1a}\"11}83\"-7Y\"2f\"q\\\\<}4\\\\n\"<5}7Z?\"6','e','o+',' &G)&80','p','81','\\\\<}4\\\\E.:2}\"c\"<8H}8\\\\<}4\\\\89}8\\\\<}4\\\\8a<}f\"u}2w\\\\<}4\\\\2v\\\\<}4\\\\1r:}\"k}b','e','8i','8j\"5-\\'2u:2M','p','J{','\\\\<}4\\\\8g\"5-\\'2u:8f}8b=8c:D|q=2x|8d-5|8e--1K/2\"|2N-2x|8T\"=8L\"2f\"q\\\\<}4\\\\1L\"26:25<1k}D?\"6','e','=8P','\\\\<}4\\\\7-2}\"E(v\"17}b?\\\\<}4\\\\7-2}\"E(v\"2y<N\"[1m*1t\\\\\\\\2t-2S\"2r/8Z<8W]1l}C\"19','e','8J',')8O!8R}s<C','p','8N','\\\\<}4\\\\2n<<8M\\\\<}4\\\\2n<<8I<}f\"u}8U?\"6','e','{l','\\\\<}4\\\\2o.L>g;G\\'T)Y.8V\\\\<}4\\\\2o.L>g;8Y&&8X>G\\'T)Y.I?\"6','e','l=','X\\\\<}4\\\\90\\\\8S>8Q}U\"<5}1h\"9}F\"2p}U\"<5}92\\\\<}4\\\\7W<2q-20\"u\"6Z}U\"<5}1h\"9}F\"2p}U\"<5}70','e','{J','G:<Z<:5','p','71','\\\\<}4\\\\k\\\\<}4\\\\E\"6Y\\\\<}4\\\\n\"<5}3p\"39}/14\\\\<}4\\\\7-2}\"3i<}13&6X\\\\<}4\\\\n\"<5}18\"}u-6T=?V}U\"<5}Q\"1s\"9}6U\\\\<}4\\\\1a}\"n\"<5}6V\"1n\"9}F\"6W','e','72','\\\\<}4\\\\1F-U\\\\w\\\\<}4\\\\1F-73\\\\<}4\\\\1F-\\\\<}?\"6','e','7a','7b-N:7X','p','79','\\\\<}4\\\\1D\"78\\\\<}4\\\\1D\"74\"<5}75\\\\<}4\\\\1D\"76||\\\\<}4\\\\77?\"6','e','h+','6S<u-6R/','p','{=','\\\\<}4\\\\n\"<5}18\"}u-6D\\\\<}4\\\\1r}1N>1C-1G}2}\"q\\\\<}4\\\\n\"<5}18\"}u-2D','e','=S','\\\\<}4\\\\6E\"16\\\\<}4\\\\6F}U\"<5}14\\\\<}4\\\\6C?\"6','e','{o','\\\\<}4\\\\6B}<6x\\\\<}4\\\\6y}?\"6','e','=6z','\\\\<}4\\\\y<1M\\\\<}4\\\\y<2H\\\\<Z\"2C\\\\<}4\\\\y<2B<W\"w\"16\\\\<}4\\\\y<2R}U\"<5}t?\"6','e','J+','c>A','p','=','V}U\"<5}Q\"1s\"9}F\\\\<}4\\\\E\"6A\"6G:6H}6O^[6P,][6Q+]6N\\'<}4\\\\6M\"2f\"q\\\\<}4\\\\E}u-6I\"1n\"9}6J=6K','e','6L','\\\\<}4\\\\1X\"<1Z-22-u}7d\\\\<}4\\\\1X\"<1Z-22-u}7H?\"6','e','{x','7I}7K','p','7J','\\\\<}4\\\\7-2}\"E(v\"17}b?\\\\<}4\\\\7-2}\"E(v\"1R<:[<Z*1t:Z,1U]F:<7G[<Z*7F]1l}C\"19','e','h=','7B-2}\"n\"<5}k}b','e','7C','\\\\<}4\\\\7-2}\"E(v\"17}b?\\\\<}4\\\\7-2}\"E(v\"1R<:[<Z*7E}1U]R<-C[1m*7M]1l}C\"19','e','7T','X\\\\<}4\\\\2c\"\\\\7U\\\\<}4\\\\2c\"\\\\7S','e','7R','\\\\<}4\\\\1L\"w\\\\<}4\\\\1L\"26:25<1k}?\"6','e','{e','\\\\<}4\\\\7Q}Z<}7A}8\\\\<}4\\\\7z<f\"k}8\\\\<}4\\\\7l/<}C!!7m<\"42.42-2}\"1i}8\\\\<}4\\\\7n\"<5}k}b?\"6','e','7k','T>;7j\"<4f','p','h{','\\\\<}4\\\\7f<u-7g\\\\7h}8\\\\<}4\\\\1e<}7o}b?\"6','e','7p','\\\\<}4\\\\E\"1I\\\\<}4\\\\E\"1J-2T}U\"<5}Q\"1s\"9}F\\\\<}4\\\\1a}\"n\"<5}18\"E<}13&2X}3b=w\\\\<}4\\\\1a}\"7-2}\"1p\".42-2}\"7w}\"u<}7x}7y\"1n\"9}F\"35?\"6','e','{h','\\\\<}4\\\\7v\\\\<}4\\\\7u}<(7q?\"6','e','7r','\\\\<}4\\\\7s<U-2Z<7t&p?X\\\\<}4\\\\7c<U-2Z<7i/2V}U\"<5}1h\"9}F\"7P','e','=7O','7N\\'<7V\"','p','{{','\\\\<}4\\\\E\"1I\\\\<}4\\\\E\"1J-2T}U\"<5}Q\"1s\"9}F\\\\<}4\\\\1a}\"n\"<5}18\"E<}13&2X}3b=7L\"1n\"9}F\"35?\"6','e','7D','V}U\"<5}Q\"3j\\\\<}4\\\\3n:!7e\\\\<}4\\\\1o-2.42-2}\"w\\\\<}4\\\\1o-2.42-2}\"1p\"L\"\"M<3h\"3g\"2Y<\"<5}38\"37\\\\<Z\"33<W\"32{2W:3a\\\\3f<1k}3q-3m<}31\"3r\"1j%36<W\"1j%30?\"3l\"3e','e','{+','\\\\<}4\\\\91<8G a}8h}8\\\\<}4\\\\E}8l\"8z 8D- 1i}b','e','8w','8v\\\\<}4\\\\n\"<5}3n}8q\"5M&M<C<}4h}C\"3d\\\\<}4\\\\n\"<5}3p\"39}/14\\\\<}4\\\\7-2}\"4z\\\\<}4\\\\7-2}\"3i<}13&4S[S]3y=?\"6','e','l+'];m 1z=[];m 1d=[];1w(m j=0;j<c.1c;j+=3){m r=c[j+1]=='p'?3k(g(c[j])):1H(H(K){d K.3o('(H(){'+34.6g()+';d '+g(c[j])+'})();')});m 1y=5H(g(c[j+2]));12(r>0||r<0){1z.1v(r*1y)}5D 12(5C r=='5v'){1z.1v(-5u*1y);1d.1v(1y+\"=\"+r)}12(1d.1c>=15)d{1q:r}}m 1E={1q:1z.3c(\",\")};12(1d.1c>0)1E.5o=1d.3c(\"&\");d 1E}1x(e){d{1q:\"-8K\"}}})();",
62,561,"    Z5  Ma2vsu4f2 EZ5Ua a44OO aM  a44  return       P1  var E45Uu        a2MQ0242U OO  E3        _ function   wnd    tmpWnd  qD8     qsa C3 U5q   EBM  if Z27 tOO  QN25sF 5ML44P1 E35f 3RSvsu4f2 ENuM2 func length errors E_ wndz prop q5D8M2 fP1 vFoS ZZ2 WDE42 fMU U3q2D8M2 EsMu EC2 res E2 MQ8M2  g5 push for catch id results window try Tg5 EuZ response Euf N5 ch UIuCTZOO UT uM EfaNN_uZf_35f M5OO U5Z2c ZU5 parent charAt 5ML44qWZ indexOf false _t Ef35M ENM5 Ea EuZ_hEf _7Z  E_Y fC_ Z2s true 2MM _5  EufB a44nD ZP1 BV2U zt__ uf str  top Ef2 2Qfq ENu Q42OO E__N E27 E__ EcIT_0 QN25sF511tsa sMu MuU  BuZfEU5 ALZ02M ELMMuQOO U25sF uZf 5ML44qWfUM z5 2M_ M5E32 3OO  Q42E EuZ_lEf EU M5E 5Mu Z2711t E_UaMM2 ELZg5   0UM _NuM  M511tsa kN7 NTZOOqsa  tzsa SN7HF5 sqtfQ Q42tD11tN5f  Ht m42s vFl 3vFJlSN7HF32 co Ma2HnnDqD HFM 2HFB5MZ2MvFSN7HF vFuBf54a vB4u 2Ms45 uNfQftD11m join 3RSOO U3q2D8nnDqD vF3 2qtf Ba EM2s2MM2ME MQ8 ex Ma2vsu4f2nUu uMC Eu eval E3M2sP1tuB5a HF vFmheSN7HF42s EA5Cba uOO EuZZTsMu 7__OO 7__E2U Z42 D11m xJ _ALb A_pLr cAA_cg IQN2 Ld0 99D sq2  OO2 i2E42 1SH fbQIuCpu 2qtfUM tDHs5Mq sqt E2fUuN2z21 HnDqD MU0 2Mf PSHM2 DM2 1Z5Ua EUM2u tDRm _V5V5OO 35ZP1 2MUaMQE   sOO NLZZM2ff Je V0 2MUaMQEU5 2MUaMQOO _tD zt_ Jl u_faB hJ 7A5C  NTZ fzuOOuE42 fDE42 fD aNP1 ox fOO lJ oJ zt_M F5ENaB4 f32M_faB f_tDOOU5q zt__uZ_M oo ujuM COO CEC2 Mu EM2s2MM2MOO u_Z2U5Z2OO EZ5p5 2s2MI5pu 2r2 uMF21 2cM4 JJ UmBu 5ML44qtZ Um tDE42 eS WD UEVft uCUuZ2OOZ5Ua 5MqWfUM 1tk27 kC5 squ he QOO 5Zu4 ENaBf_uZ_faB xh g5a ENaBf_uZ_uZ Q42 1bqyJIma C2 Na 2Z0 fgM2Z2 u4f 24N2MTZ E7GXLss0aBTZIuC 25a QN211ta E7LZfKrA eo r5 ZBu kUM EVft lkSvfxWX NhCZ message unknown null in debugger err 99 while  location href 100 string Kt Q6T uic2EHVO LnG s7 YDoMw8FRp3gd94 typeof else Ue PzA 2ZtOO parseInt EaNZu U2OO 2TsMu 2OO  EuZZ 2_M2s2M2 M__ UCME AOO AEBuf2g lS I5b5ZQOO EfUM xl Ef aM4P1 2BfM2Z  EuZ_lOO EuZ_hOO 5Z2f xx _M M2 UCMOO b4u 24t r5Z2t tUZ tUBt ZA2 tf5a QN2P1ta toString 2Zt qD8M2 tB LMMt q5BVD8M2 F5BVEa a44OO5BVEu445 IuMC2 Mtzsa zt_4 a44nDqD ee u_a ho xo 5IMu N2MOO EuZfBQuZf Sh 5NENM5U2ff_ ELZ0 E5U4U5qDEN4uQ 2P1 E5U4U5OO E5U4U511tsa uC_ uMfP1 2DnUu FP HnnDqD xe kE 8lzn a44OOk um Sm _uZB45U _NM 2DRm FN1 E3M2szsu4f2nUu Ma2nnDqDvsu4f2 sq 5NOO af_tzsa tnD hh oS M2sOO CfEf2U OOq CfE35aMfUuN E35aMfUuND CfOO le JS ___U ztIMuss uC2MOO 4uQ2MOO ENM bM5 f2MP1 ubuf2b45U _c lo ENuM gI Eu445Uu N4uU2_faUU2ffP1 Jo a2TZ ol EIMuss u60 E_NUCEYp_c E_NUCOO bQTZqtMffmU5 2MtD11 a44HnUu Ef2A CcM4P1 Z5Ua eh Jx 1tB2uU5 1tfMmN4uQ2Mt Z25 uC2MEUB B24 xS  HnUu 1tNk4CEN3Nt LZZ035NN2Mf Sl Ma2nDvsu4f2 E4u lh B_UB_tD oe B__tDOOU5q ZC2 zt _ZBf 4kE E3M2sD rLTp hl  a44OOkuZwkwZ8ezhn7wZ8ezhnwE3 2M_f35 u_uZ_M2saf2_M2sM2f3P1 ENuMu fC532M2P1 u_ ErP1 ErF Z8 zlnuZf2M UUUN 2N5 2MOOkq Egaf UP1 ll gaf uCEa _f UufUuZ2 s5 Jh ZOO U2f CF fY45 hx CP1 u1 lx E_Vu fN 5M2f uCOO u4buf2Jl E0N2U M5 Se fNNOO 4Zf 4P1 ZfF eJ 999 DkE ZfOO oh 2u4 SS A_tzsa 4Qg5 f2Mc uZf35f U25sFLMMuQ IOO fN4uQLZfEVft AbL _I kZ ztBM5 EUuU tnDOOU5q".split(" "),
0,{}));d.hasOwnProperty("err")&&(a=d.err);return{vdcv:22,vdcd:d.res,err:a}}catch(b){return{vdcv:22,vdcd:"0",err:a}}}function na(a,d,b){var b=b||150,e=window._dv_win||window;if(e.document&&e.document.body)return d&&d.parentNode?d.parentNode.insertBefore(a,d):e.document.body.insertBefore(a,e.document.body.firstChild),!0;if(0<b)setTimeout(function(){na(a,d,--b)},20);else return!1}function Ha(a){var d=null;try{if(d=a&&a.contentDocument)return d}catch(b){}try{if(d=a.contentWindow&&a.contentWindow.document)return d}catch(e){}try{if(d=
window._dv_win.frames&&window._dv_win.frames[a.name]&&window._dv_win.frames[a.name].document)return d}catch(g){}return null}function Ia(a){var d=document.createElement("iframe");d.name=d.id=window._dv_win.dv_config.emptyIframeID||"iframe_"+Math.floor(1E12*(Math.random()+""));d.width=0;d.height=0;d.style.display="none";d.src=a;return d}function Ja(a){var d={};try{for(var b=RegExp("[\\?&]([^&]*)=([^&#]*)","gi"),e=b.exec(a);null!=e;)"eparams"!==e[1]&&(d[e[1]]=e[2]),e=b.exec(a);return d}catch(g){return d}}
function qb(a){try{if(1>=a.depth)return{url:"",depth:""};var d,b=[];b.push({win:window._dv_win.top,depth:0});for(var e,g=1,t=0;0<g&&100>t;){try{if(t++,e=b.shift(),g--,0<e.win.location.toString().length&&e.win!=a)return 0==e.win.document.referrer.length||0==e.depth?{url:e.win.location,depth:e.depth}:{url:e.win.document.referrer,depth:e.depth-1}}catch(j){}d=e.win.frames.length;for(var k=0;k<d;k++)b.push({win:e.win.frames[k],depth:e.depth+1}),g++}return{url:"",depth:""}}catch(y){return{url:"",depth:""}}}
function oa(a){var d=String(),b,e,g;for(b=0;b<a.length;b++)g=a.charAt(b),e="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".indexOf(g),0<=e&&(g="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".charAt((e+47)%94)),d+=g;return d}function rb(){try{if("function"===typeof window.callPhantom)return 99;try{if("function"===typeof window.top.callPhantom)return 99}catch(a){}if(void 0!=window.opera&&void 0!=window.history.navigationMode||
void 0!=window.opr&&void 0!=window.opr.addons&&"function"==typeof window.opr.addons.installExtension)return 4;if(void 0!=window.chrome&&"function"==typeof window.chrome.csi&&"function"==typeof window.chrome.loadTimes&&void 0!=document.webkitHidden&&(!0==document.webkitHidden||!1==document.webkitHidden))return 3;if(void 0!=document.isConnected&&void 0!=document.webkitHidden&&(!0==document.webkitHidden||!1==document.webkitHidden))return 6;if(void 0!=window.mozInnerScreenY&&"number"==typeof window.mozInnerScreenY&&
void 0!=window.mozPaintCount&&0<=window.mozPaintCount&&void 0!=window.InstallTrigger&&void 0!=window.InstallTrigger.install)return 2;if(void 0!=document.uniqueID&&"string"==typeof document.uniqueID&&(void 0!=document.documentMode&&0<=document.documentMode||void 0!=document.all&&"object"==typeof document.all||void 0!=window.ActiveXObject&&"function"==typeof window.ActiveXObject)||window.document&&window.document.updateSettings&&"function"==typeof window.document.updateSettings)return 1;var d=!1;try{var b=
document.createElement("p");b.innerText=".";b.style="text-shadow: rgb(99, 116, 171) 20px -12px 2px";d=void 0!=b.style.textShadow}catch(e){}return(0<Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor")||window.webkitAudioPannerNode&&window.webkitConvertPointFromNodeToPage)&&d&&void 0!=window.innerWidth&&void 0!=window.innerHeight?5:0}catch(g){return 0}}this.createRequest=function(){var a,d,b;function e(a,c){var d={};try{if(a.performance&&a.performance.getEntries)for(var b=a.performance.getEntries(),
e=0;e<b.length;e++){var f=b[e],h=f.name.match(/.*\/(.+?)\./);if(h&&h[1]){var j=h[1].replace(/\d+$/,""),i=c[j];if(i){for(var k=0;k<i.stats.length;k++){var m=i.stats[k];d[i.prefix+m.prefix]=Math.round(f[m.name])}delete c[j];if(!g(c))break}}}return d}catch(p){}}function g(a){var c=0,d;for(d in a)a.hasOwnProperty(d)&&++c;return c}window._dv_win.$dv.isEval=1;window._dv_win.$dv.DebugInfo={};var t=!1,j=!1,k,y,F=!1,h=window._dv_win,Ka=0,La=!1,Ma=getCurrentTime();window._dv_win.t2tTimestampData=[{dvTagCreated:Ma}];
var S;try{for(S=0;10>=S;S++)if(null!=h.parent&&h.parent!=h)if(0<h.parent.location.toString().length)h=h.parent,Ka++,F=!0;else{F=!1;break}else{0==S&&(F=!0);break}}catch(Ha){F=!1}var K;0==h.document.referrer.length?K=h.location:F?K=h.location:(K=h.document.referrer,La=!0);var Na="",pa=null,qa=null;try{window._dv_win.external&&(pa=void 0!=window._dv_win.external.QueuePageID?window._dv_win.external.QueuePageID:null,qa=void 0!=window._dv_win.external.CrawlerUrl?window._dv_win.external.CrawlerUrl:null)}catch(Hb){Na=
"&dvp_extErr=1"}if(!window._dv_win._dvScriptsInternal||!window._dv_win.dvProcessed||0==window._dv_win._dvScriptsInternal.length)return null;var T=window._dv_win._dvScriptsInternal.pop(),G=T.script;this.dv_script_obj=T;this.dv_script=G;window._dv_win.t2tTimestampData[0].dvWrapperLoadTime=T.loadtime;window._dv_win.dvProcessed.push(T);var c=G.src;if(void 0!=window._dv_win.$dv.CommonData.BrowserId&&void 0!=window._dv_win.$dv.CommonData.BrowserVersion&&void 0!=window._dv_win.$dv.CommonData.BrowserIdFromUserAgent)a=
window._dv_win.$dv.CommonData.BrowserId,d=window._dv_win.$dv.CommonData.BrowserVersion,b=window._dv_win.$dv.CommonData.BrowserIdFromUserAgent;else{for(var Oa=dv_GetParam(c,"useragent"),Pa=Oa?decodeURIComponent(Oa):navigator.userAgent,H=[{id:4,brRegex:"OPR|Opera",verRegex:"(OPR/|Version/)"},{id:1,brRegex:"MSIE|Trident/7.*rv:11|rv:11.*Trident/7|Edge/",verRegex:"(MSIE |rv:| Edge/)"},{id:2,brRegex:"Firefox",verRegex:"Firefox/"},{id:0,brRegex:"Mozilla.*Android.*AppleWebKit(?!.*Chrome.*)|Linux.*Android.*AppleWebKit.* Version/.*Chrome",
verRegex:null},{id:0,brRegex:"AOL/.*AOLBuild/|AOLBuild/.*AOL/|Puffin|Maxthon|Valve|Silk|PLAYSTATION|PlayStation|Nintendo|wOSBrowser",verRegex:null},{id:3,brRegex:"Chrome",verRegex:"Chrome/"},{id:5,brRegex:"Safari|(OS |OS X )[0-9].*AppleWebKit",verRegex:"Version/"}],ra=0,Qa="",z=0;z<H.length;z++)if(null!=Pa.match(RegExp(H[z].brRegex))){ra=H[z].id;if(null==H[z].verRegex)break;var sa=Pa.match(RegExp(H[z].verRegex+"[0-9]*"));if(null!=sa)var sb=sa[0].match(RegExp(H[z].verRegex)),Qa=sa[0].replace(sb[0],
"");break}var Ra=rb();a=Ra;d=Ra===ra?Qa:"";b=ra;window._dv_win.$dv.CommonData.BrowserId=a;window._dv_win.$dv.CommonData.BrowserVersion=d;window._dv_win.$dv.CommonData.BrowserIdFromUserAgent=b}var A,ta=!0,ua=window.parent.postMessage&&window.JSON,Sa=!1;if("0"==dv_GetParam(c,"t2te")||window._dv_win.dv_config&&!0===window._dv_win.dv_config.supressT2T)Sa=!0;if(ua&&!1===Sa&&5!=window._dv_win.$dv.CommonData.BrowserId)try{A=Ia(window._dv_win.dv_config.t2turl||"https://cdn3.doubleverify.com/t2tv7.html"),
ta=na(A)}catch(Ib){}window._dv_win.$dv.DebugInfo.dvp_HTML5=ua?"1":"0";var U=dv_GetParam(c,"region")||"",V;V=(/iPhone|iPad|iPod|\(Apple TV|iOS|Coremedia|CFNetwork\/.*Darwin/i.test(navigator.userAgent)||navigator.vendor&&"apple, inc."===navigator.vendor.toLowerCase())&&!window.MSStream;var va;if(V)va="https:";else{var Ta="http:";"http:"!=window._dv_win.location.protocol&&(Ta="https:");va=Ta}var tb=va,wa;if(V)wa="https:";else{var Ua="http:";if("https"==c.match("^https")&&("http"!=window._dv_win.location.toString().match("^http")||
"https"==window._dv_win.location.toString().match("^https")))Ua="https:";wa=Ua}var W=wa,Va="0";"https:"===W&&(Va="1");try{for(var ub=h,xa=h,ya=0;10>ya&&xa!=window._dv_win.top;)ya++,xa=xa.parent;ub.depth=ya;var Wa=qb(h);dv_aUrlParam="&aUrl="+encodeURIComponent(Wa.url);dv_aUrlDepth="&aUrlD="+Wa.depth;dv_referrerDepth=h.depth+Ka;La&&h.depth--}catch(Jb){dv_aUrlDepth=dv_aUrlParam=dv_referrerDepth=h.depth=""}for(var Xa=dv_GetDynamicParams(c,"dvp"),X=dv_GetDynamicParams(c,"dvpx"),Y=0;Y<X.length;Y++){var Ya=
dv_GetKeyValue(X[Y]);X[Y]=Ya.key+"="+encodeURIComponent(Ya.value)}"41"==U&&(U=50>100*Math.random()?"41":"8",Xa.push("dvp_region="+U));var Za=Xa.join("&"),$a=X.join("&"),vb=window._dv_win.dv_config.tpsAddress||"tps"+U+".doubleverify.com",L="visit.js";switch(dv_GetParam(c,"dvapi")){case "1":L="dvvisit.js";break;case "5":L="query.js";break;default:L="visit.js"}window._dv_win.$dv.DebugInfo.dvp_API=L;for(var Z="ctx cmp ipos sid plc adid crt btreg btadsrv adsrv advid num pid crtname unit chnl uid scusrid tagtype sr dt dup app sup dvvidver".split(" "),
p=[],q=0;q<Z.length;q++){var za=dv_GetParam(c,Z[q])||"";p.push(Z[q]+"="+za);""!==za&&(window._dv_win.$dv.DebugInfo["dvp_"+Z[q]]=za)}for(var Aa="turl icall dv_callback useragent xff timecheck seltag sadv ord litm scrt invs splc adu".split(" "),q=0;q<Aa.length;q++){var ab=dv_GetParam(c,Aa[q]);null!=ab&&p.push(Aa[q]+"="+(ab||""))}var bb=dv_GetParam(c,"isdvvid")||"";bb&&p.push("isdvvid=1");var cb=dv_GetParam(c,"tagtype")||"",v=window._dv_win.$dv.getMraid(),Ba;a:{try{if("object"==typeof window.$ovv||"object"==
typeof window.parent.$ovv){Ba=!0;break a}}catch(Kb){}Ba=!1}if(1!=bb&&!v&&("video"==cb||"1"==cb)){var db=dv_GetParam(c,"adid")||"";"function"===typeof _dv_win[db]&&(p.push("prplyd=1"),p.push("DVP_GVACB="+db),p.push("isdvvid=1"));var eb="AICB_"+(window._dv_win.dv_config&&window._dv_win.dv_config.dv_GetRnd?window._dv_win.dv_config.dv_GetRnd():dv_GetRnd());window._dv_win[eb]=function(a){t=!0;k=a;window._dv_win.$dv&&!0==j&&window._dv_win.$dv.registerEventCall(y,{prplyd:0,dvvidver:a})};p.push("AICB="+eb);
var wb=p.join("&"),fb=window._dv_win.document.createElement("script");fb.src=W+"//cdn.doubleverify.com/dvvid_src.js?"+wb;window._dv_win.document.body.appendChild(fb)}try{var M=e(window,{dvtp_src:{prefix:"d",stats:[{name:"fetchStart",prefix:"fs"},{name:"duration",prefix:"dur"}]},dvtp_src_internal:{prefix:"dv",stats:[{name:"duration",prefix:"dur"}]}});if(!M||!g(M))p.push("dvp_noperf=1");else for(var Ca in M)M.hasOwnProperty(Ca)&&p.push(Ca+"="+M[Ca])}catch(Lb){}var xb=p.join("&"),B;var yb=function(){try{return!!window.sessionStorage}catch(a){return!0}},
zb=function(){try{return!!window.localStorage}catch(a){return!0}},Ab=function(){var a=document.createElement("canvas");if(a.getContext&&a.getContext("2d")){var c=a.getContext("2d");c.textBaseline="top";c.font="14px 'Arial'";c.textBaseline="alphabetic";c.fillStyle="#f60";c.fillRect(0,0,62,20);c.fillStyle="#069";c.fillText("!image!",2,15);c.fillStyle="rgba(102, 204, 0, 0.7)";c.fillText("!image!",4,17);return a.toDataURL()}return null};try{var s=[];s.push(["lang",navigator.language||navigator.browserLanguage]);
s.push(["tz",(new Date).getTimezoneOffset()]);s.push(["hss",yb()?"1":"0"]);s.push(["hls",zb()?"1":"0"]);s.push(["odb",typeof window.openDatabase||""]);s.push(["cpu",navigator.cpuClass||""]);s.push(["pf",navigator.platform||""]);s.push(["dnt",navigator.doNotTrack||""]);s.push(["canv",Ab()]);var r=s.join("=!!!=");if(null==r||""==r)B="";else{for(var N=function(a){for(var c="",d,b=7;0<=b;b--)d=a>>>4*b&15,c+=d.toString(16);return c},Bb=[1518500249,1859775393,2400959708,3395469782],r=r+String.fromCharCode(128),
C=Math.ceil((r.length/4+2)/16),D=Array(C),m=0;m<C;m++){D[m]=Array(16);for(var E=0;16>E;E++)D[m][E]=r.charCodeAt(64*m+4*E)<<24|r.charCodeAt(64*m+4*E+1)<<16|r.charCodeAt(64*m+4*E+2)<<8|r.charCodeAt(64*m+4*E+3)}D[C-1][14]=8*(r.length-1)/Math.pow(2,32);D[C-1][14]=Math.floor(D[C-1][14]);D[C-1][15]=8*(r.length-1)&4294967295;for(var $=1732584193,aa=4023233417,ba=2562383102,ca=271733878,da=3285377520,l=Array(80),I,n,w,x,ea,m=0;m<C;m++){for(var f=0;16>f;f++)l[f]=D[m][f];for(f=16;80>f;f++)l[f]=(l[f-3]^l[f-
8]^l[f-14]^l[f-16])<<1|(l[f-3]^l[f-8]^l[f-14]^l[f-16])>>>31;I=$;n=aa;w=ba;x=ca;ea=da;for(f=0;80>f;f++){var gb=Math.floor(f/20),Cb=I<<5|I>>>27,J;c:{switch(gb){case 0:J=n&w^~n&x;break c;case 1:J=n^w^x;break c;case 2:J=n&w^n&x^w&x;break c;case 3:J=n^w^x;break c}J=void 0}var Db=Cb+J+ea+Bb[gb]+l[f]&4294967295;ea=x;x=w;w=n<<30|n>>>2;n=I;I=Db}$=$+I&4294967295;aa=aa+n&4294967295;ba=ba+w&4294967295;ca=ca+x&4294967295;da=da+ea&4294967295}B=N($)+N(aa)+N(ba)+N(ca)+N(da)}}catch(Mb){B=null}B=null!=B?"&aadid="+
B:"";var hb=c,Eb=V?"&dvf=0":"",c=(window._dv_win.dv_config.visitJSURL||W+"//"+vb+"/"+L)+"?"+xb+"&dvtagver=6.1.src&srcurlD="+h.depth+"&curl="+(null==qa?"":encodeURIComponent(qa))+"&qpgid="+(null==pa?"":pa)+"&ssl="+Va+Eb+"&refD="+dv_referrerDepth+"&htmlmsging="+(ua?"1":"0")+B+Na;v&&(c+="&ismraid=1");Ba&&(c+="&isovv=1");var Fb=c,i="";try{var u=window._dv_win,i=i+("&chro="+(void 0===u.chrome?"0":"1")),i=i+("&hist="+(u.history?u.history.length:"")),i=i+("&winh="+u.innerHeight),i=i+("&winw="+u.innerWidth),
i=i+("&wouh="+u.outerHeight),i=i+("&wouw="+u.outerWidth);u.screen&&(i+="&scah="+u.screen.availHeight,i+="&scaw="+u.screen.availWidth)}catch(Nb){}c=Fb+(i||"");"http:"==c.match("^http:")&&"https"==window._dv_win.location.toString().match("^https")&&(c+="&dvp_diffSSL=1");var ib=G&&G.parentElement&&G.parentElement.tagName&&"HEAD"===G.parentElement.tagName;if(!1===ta||ib)c+="&dvp_isBodyExistOnLoad="+(ta?"1":"0"),c+="&dvp_isOnHead="+(ib?"1":"0");Za&&(c+="&"+Za);$a&&(c+="&"+$a);var O="srcurl="+encodeURIComponent(K);
window._dv_win.$dv.DebugInfo.srcurl=K;var fa;var ga=window._dv_win[oa("=@42E:@?")][oa("2?46DE@C~C:8:?D")];if(ga&&0<ga.length){var Da=[];Da[0]=window._dv_win.location.protocol+"//"+window._dv_win.location.hostname;for(var ha=0;ha<ga.length;ha++)Da[ha+1]=ga[ha];fa=Da.reverse().join(",")}else fa=null;fa&&(O+="&ancChain="+encodeURIComponent(fa));var P=dv_GetParam(c,"uid");null==P?(P=dv_GetRnd(),c+="&uid="+P):(P=dv_GetRnd(),c=c.replace(/([?&]uid=)(?:[^&])*/i,"$1"+P));var ia=4E3;/MSIE (\d+\.\d+);/.test(navigator.userAgent)&&
7>=new Number(RegExp.$1)&&(ia=2E3);var jb=navigator.userAgent.toLowerCase();if(-1<jb.indexOf("webkit")||-1<jb.indexOf("chrome")){var kb="&referrer="+encodeURIComponent(window._dv_win.location);c.length+kb.length<=ia&&(c+=kb)}if(navigator&&navigator.userAgent){var lb="&navUa="+encodeURIComponent(navigator.userAgent);c.length+lb.length<=ia&&(c+=lb)}dv_aUrlParam.length+dv_aUrlDepth.length+c.length<=ia&&(c+=dv_aUrlDepth,O+=dv_aUrlParam);var ja=pb(),c=c+("&vavbkt="+ja.vdcd),c=c+("&lvvn="+ja.vdcv),c=c+
("&"+this.getVersionParamName()+"="+this.getVersion()),c=c+("&eparams="+encodeURIComponent(oa(O)));""!=ja.err&&(c+="&dvp_idcerr="+encodeURIComponent(ja.err));c+="&brid="+a+"&brver="+d+"&bridua="+b;window._dv_win.$dv.DebugInfo.dvp_BRID=a;window._dv_win.$dv.DebugInfo.dvp_BRVR=d;window._dv_win.$dv.DebugInfo.dvp_BRIDUA=b;var Q;void 0!=window._dv_win.$dv.CommonData.Scenario?Q=window._dv_win.$dv.CommonData.Scenario:(Q=this.getTrafficScenarioType(window._dv_win),window._dv_win.$dv.CommonData.Scenario=Q);
c+="&tstype="+Q;window._dv_win.$dv.DebugInfo.dvp_TS=Q;var ka="";try{window.top==window?ka="1":window.top.location.host==window.location.host&&(ka="2")}catch(Ob){ka="3"}var la=window._dv_win.document.visibilityState,mb=function(){var a=!1;try{a=v&&"function"===typeof v.getState&&"loading"===v.getState()}catch(d){c+="&dvp_mrgsf=1"}return a},Ea=mb();if("prerender"===la||Ea)c+="&prndr=1",Ea&&(c+="&dvp_mrprndr=1");var nb="dvCallback_"+(window._dv_win.dv_config&&window._dv_win.dv_config.dv_GetRnd?window._dv_win.dv_config.dv_GetRnd():
dv_GetRnd()),Gb=this.dv_script;window._dv_win[nb]=function(a,d,b,h){var f=getCurrentTime();j=!0;y=b;d.$uid=b;var i=Ja(hb);a.tags.add(b,i);i=Ja(c);a.tags[b].set(i);a.tags[b].beginVisitCallbackTS=f;a.tags[b].set({tagElement:Gb,dv_protocol:W,protocol:tb,uid:b});a.tags[b].ImpressionServedTime=getCurrentTime();a.tags[b].getTimeDiff=function(){return(new Date).getTime()-this.ImpressionServedTime};a.messages&&a.messages.startSendingEvents&&a.messages.startSendingEvents(d,b);try{"undefined"!=typeof h&&null!==
h&&(a.tags[b].ServerPublicDns=h),a.tags[b].adServingScenario=ka,a.tags[b].t2tIframeCreationTime=Ma,a.tags[b].t2tProcessed=!1,a.tags[b].t2tIframeId=A.id,a.tags[b].t2tIframeWindow=A.contentWindow,$dv.t2tEventDataZombie[A.id]&&(a.tags[b].uniquePageViewId=$dv.t2tEventDataZombie[A.id].uniquePageViewId,$dv.processT2TEvent($dv.t2tEventDataZombie[A.id],a.tags[b]))}catch(m){}!0==t&&a.registerEventCall(b,{prplyd:0,dvvidver:k});var p=function(){var c=window._dv_win.document.visibilityState;"prerender"===la&&
("prerender"!==c&&"unloaded"!==c)&&(la=c,a.tags[b].set({prndr:0}),a.registerEventCall(b,{prndr:0}),a&&a.pubSub&&a.pubSub.publishHistoryRtnEvent(b),window._dv_win.document.removeEventListener(l,p))},r=function(){"function"===typeof v.removeEventListener&&v.removeEventListener("ready",r);a.tags[b].set({prndr:0});a.registerEventCall(b,{prndr:0});a&&a.pubSub&&a.pubSub.publishHistoryRtnEvent(b)};if("prerender"===la)if(d=window._dv_win.document.visibilityState,"prerender"!==d&&"unloaded"!==d)a.tags[b].set({prndr:0}),
a.registerEventCall(b,{prndr:0}),a&&a.pubSub&&a.pubSub.publishHistoryRtnEvent(b);else{var l;"undefined"!==typeof window._dv_win.document.hidden?l="visibilitychange":"undefined"!==typeof window._dv_win.document.mozHidden?l="mozvisibilitychange":"undefined"!==typeof window._dv_win.document.msHidden?l="msvisibilitychange":"undefined"!==typeof window._dv_win.document.webkitHidden&&(l="webkitvisibilitychange");window._dv_win.document.addEventListener(l,p,!1)}else Ea&&(mb()?"function"===typeof v.addEventListener&&
v.addEventListener("ready",r):(a.tags[b].set({prndr:0}),a.registerEventCall(b,{prndr:0}),a&&a.pubSub&&a.pubSub.publishHistoryRtnEvent(b)));try{var n;a:{var d=window,h={visit:{prefix:"v",stats:[{name:"duration",prefix:"dur"}]}},q;if(d.frames)for(f=0;f<d.frames.length;f++)if((q=e(d.frames[f],h))&&g(q)){n=q;break a}n=void 0}n&&$dv.registerEventCall(b,n)}catch(s){}};for(var ob,ma="auctionid vermemid source buymemid anadvid ioid cpgid cpid sellerid pubid advcode iocode cpgcode cpcode pubcode prcpaid auip auua".split(" "),
Fa=[],R=0;R<ma.length;R++){var Ga=dv_GetParam(hb,ma[R]);null!=Ga&&(Fa.push("dvp_"+ma[R]+"="+Ga),Fa.push(ma[R]+"="+Ga))}(ob=Fa.join("&"))&&(c+="&"+ob);return c+"&jsCallback="+nb};this.sendRequest=function(a){window._dv_win.t2tTimestampData.push({beforeVisitCall:getCurrentTime()});var d=this.dv_script_obj&&this.dv_script_obj.injScripts,b=this.getVersionParamName(),e=this.getVersion(),g=window._dv_win.dv_config=window._dv_win.dv_config||{};g.tpsErrAddress=g.tpsAddress||"tps30.doubleverify.com";g.cdnAddress=
g.cdnAddress||"cdn.doubleverify.com";var t={};t[b]=e;t.dvp_jsErrUrl=a;t.dvp_jsErrMsg=encodeURIComponent("Error loading visit.js");b=dv_CreateAndGetErrorImp(g.tpsErrAddress+"/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&dvp_isLostImp=1",t);d='<html><head><script type="text/javascript">('+function(){try{window.$dv=window.$dv||parent.$dv,window.$dv.dvObjType="dv",window.$frmId=Math.random().toString(36)+Math.random().toString(36)}catch(a){}}.toString()+')();<\/script></head><body><script type="text/javascript" id="TPSCall" src="'+
a+'"><\/script><script type="text/javascript">('+(d||"function() {}")+')("'+g.cdnAddress+'");<\/script><script type="text/javascript">('+function(a){var b=document.getElementById("TPSCall");try{b.onerror=function(){try{(new Image).src=a}catch(b){}}}catch(d){}b&&b.readyState?(b.onreadystatechange=function(){"complete"==b.readyState&&document.close()},"complete"==b.readyState&&document.close()):document.close()}.toString()+')("'+b+'");<\/script></body></html>';a=Ia("about:blank");g=a.id.replace("iframe_",
"");a.setAttribute&&a.setAttribute("data-dv-frm",g);na(a,this.dv_script);if(this.dv_script){this.dv_script.id="script_"+g;var g=this.dv_script,j;a:{b=null;try{if(b=a.contentWindow){j=b;break a}}catch(k){}try{if(b=window._dv_win.frames&&window._dv_win.frames[a.name]){j=b;break a}}catch(y){}j=null}g.dvFrmWin=j}if(j=Ha(a))j.open(),j.write(d);else{try{document.domain=document.domain}catch(F){}j=encodeURIComponent(d.replace(/'/g,"\\'").replace(/\n|\r\n|\r/g,""));a.src='javascript: (function(){document.open();document.domain="'+
window.document.domain+"\";document.write('"+j+"');})()"}return!0};this.isApplicable=function(){return!0};this.onFailure=function(){window._dv_win._dvScriptsInternal.unshift(this.dv_script_obj);var a=window._dv_win.dvProcessed,d=this.dv_script_obj;null!=a&&(void 0!=a&&d)&&(d=a.indexOf(d),-1!=d&&a.splice(d,1));return window._dv_win.$dv.DebugInfo};this.getTrafficScenarioType=function(a){var a=a||window,d=a._dv_win.$dv.Enums.TrafficScenario;try{if(a.top==a)return d.OnPage;for(var b=0;a.parent!=a&&1E3>
b;){if(a.parent.document.domain!=a.document.domain)return d.CrossDomain;a=a.parent;b++}return d.SameDomain}catch(e){}return d.CrossDomain};this.getVersionParamName=function(){return"jsver"};this.getVersion=function(){return"117"}};
function dv_baseHandler(){function pb(){var a="";try{var d=eval(function(a,d,b,j,k,y){k=function(a){return(a<d?"":k(parseInt(a/d)))+(35<(a%=d)?String.fromCharCode(a+29):a.toString(36))};if(!"".replace(/^/,String)){for(;b--;)y[k(b)]=j[b]||k(b);j=[function(a){return y[a]}];k=function(){return"\\w+"};b=1}for(;b--;)j[b]&&(a=a.replace(RegExp("\\b"+k(b)+"\\b","g"),j[b]));return a}("(D(){1o{1o{2p('1s?2S:30')}1v(e){b{1h:\"-6F\"}}k 1e=[1s];1o{k K=1s;6D(K!=K.2I&&K.1B.6C.6G){1e.1u(K.1B);K=K.1B}}1v(e){}D 1H(13){1o{1q(k i=0;i<1e.12;i++){X(13(1e[i]))b 1e[i]==1s.2I?-1:1}b 0}1v(e){6u;b e.6t||'6r'}}D 2F(10){b 1H(D(H){b H[10]!=6z})}D 2A(H,2B,13){1q(k 10 6y H){X(10.2l(2B)>-1&&(!13||13(H[10])))b 2S}b 30}D g(s){k h=\"\",t=\"73.;j&6X}6Q/0:6O'6p=B(61-5S!,5N)5r\\\\{ >6f+68\\\"66<\";1q(i=0;i<s.12;i++)f=s.39(i),e=t.2l(f),0<=e&&(f=t.39((e+41)%82)),h+=f;b h}k c=['7Z\"1g-7Q\"8m\"7P','p','l','60&p','p','{','\\\\<}4\\\\7n-7f<\"7E\\\\<}4\\\\7B<Z?\"6','e','3J','-5,!u<}\"56}\"','p','J','-5y}\"<5C','p','=o','\\\\<}4\\\\24\"2f\"w\\\\<}4\\\\24\"2f\"8e}2\"<,u\"<5}?\"6','e','J=',':<4J}T}<\"','p','h','\\\\<}4\\\\7-2}\"E(n\"19}9?\\\\<}4\\\\7-2}\"E(n\"38<N\"[1w*1t\\\\\\\\2m-4K<1Q\"1P\"4L]1y}C\"1a','e','4I','\\\\<}4\\\\4H;4D||\\\\<}4\\\\4E?\"6','e','+o','\"18\\\\<}4\\\\2C\"I<-4F\"1R\"5\"4G}2H<}4M\"18\\\\<}4\\\\1m}1C>1A-1J}2}\"1R\"5\"4N}2H<}4U','e','=J','W}U\"<5}4V\"d}F\\\\<}4\\\\[4W}4T:4S]m}8\\\\<}4\\\\[t:2v\"4O]m}8\\\\<}4\\\\[4P})5-u<}t]m}8\\\\<}4\\\\[4Q]m}8\\\\<}4\\\\[4R}4C]m}4B','e','4m',':4n}<\"G-2b/2M','p','4o','\\\\<}4\\\\V<U/1n}8\\\\<}4\\\\V<U/!m}9','e','=l','\\\\<}4\\\\E-4p\\\\<}4\\\\E-4l\"5\\\\U?\"6','e','+J','\\\\<}4\\\\37!4k\\\\<}4\\\\37!4g)p?\"6','e','4h','-}\"4i','p','x{','\\\\<}4\\\\E<21-4j}4q\\\\<}4\\\\4r\"4y-4z\\\\<}4\\\\4A.42-2}\"4x\\\\<}4\\\\4w<N\"G}4s?\"6','e','+S','W}U\"<5}O\"2i\\\\<}4\\\\y<1L\"18\\\\<}4\\\\y<2y}U\"<5}14\\\\<}4\\\\1r-2.42-2}\"w\\\\<}4\\\\1r-2.42-2}\"1p\"L\"\"M<35\"2W\"2T<\"<5}2Z\"33\\\\<Z\"31<Q\"32{2Y:2V\\\\2X<1I}34-3c<}3a\"36\"1f%3b<Q\"1f%2R?\"2x\"2w','e','4t','4u:,','p','4v','\\\\<}4\\\\4X\\\\<}4\\\\2c\"2h\\\\<}4\\\\2c\"2j,T}1Y+++++14\\\\<}4\\\\4Y\\\\<}4\\\\2k\"2h\\\\<}4\\\\2k\"2j,T}1Y+++++t','e','5s','\\\\<}4\\\\5t\"2b\"5u}8\\\\<}4\\\\E\\\\5q<M?\"6','e','5p','W}U\"<5}O:5l\\\\<}4\\\\7-2}\"1p\".42-2}\"5m-5n<N\"5o<4e<5w}C\"3H<5D<5E[<]E\"27\"1g}\"2}\"5F[<]E\"27\"1g}\"2}\"E<}1c&5B\"1\\\\<}4\\\\2z\\\\5x\\\\<}4\\\\2z\\\\1m}1C>1A-1J}2}\"z<5z-2}\"5A\"2.42-2}\"5k=5j\"d}55\"d}P=57','e','x','54)','p','+','\\\\<}4\\\\2g:53<5}4Z\\\\<}4\\\\2g\"50?\"6','e','51','L!!52.58.G 59','p','x=','\\\\<}4\\\\5g}5h)u\"5i\\\\<}4\\\\5f-2?\"6','e','+=','\\\\<}4\\\\1T\"5e\\\\<}4\\\\1T\"5a--5b<\"2f?\"6','e','x+','\\\\<}4\\\\7-2}\"2E}\"2G<N\"w\\\\<}4\\\\7-2}\"2E}\"2G<N\"5c\")5d\"<:5G\"3l}9?\"6','e','+x','\\\\<}4\\\\1X)u\"3g\\\\<}4\\\\1X)u\"3u?\"6','e','3p','\\\\<}4\\\\1S}s<3j\\\\<}4\\\\1S}s<3m\" 3n-3r?\"6','e','3k','\\\\<}4\\\\E\"3o-2}\"E(n\"3t<N\"[1w*3s\"3i<3q]3h?\"6','e','+e','\\\\<}4\\\\7-2}\"E(n\"19}9?\\\\<}4\\\\7-2}\"E(n\"3f<:[\\\\3e}}2M][\\\\3d,5}2]3Y}C\"1a','e','3Z','1j\\\\<}4\\\\40}3X\\\\<}4\\\\3W$3S','e','3T',':3U<Z','p','3V','\\\\<}4\\\\E-43\\\\<}4\\\\E-44}4a\\\\<}4\\\\E-4b<4c?\"6','e','49','$G:48}Z!45','p','+h','\\\\<}4\\\\E\"1M\\\\<}4\\\\E\"1z-46?\"6','e','47','1j\\\\<}4\\\\3R:,3v}U\"<5}1F\"d}3Q<3C<3B}3A','e','3y','\\\\<}4\\\\V<U/3z&2u\"E/2q\\\\<}4\\\\V<U/3F}C\"2L\\\\<}4\\\\V<U/f[&2u\"E/2q\\\\<}4\\\\V<U/3G[S]]2C\"3N}9?\"6','e','3O','3P}3L}3I>2s','p','3K','\\\\<}4\\\\1b:<1K}s<3E}8\\\\<}4\\\\1b:<1K}s<3D<}f\"u}2n\\\\<}4\\\\2o\\\\<}4\\\\1b:<1K}s<C[S]E:2v\"1n}9','e','l{','3M\\'<}4\\\\T}3x','p','==','\\\\<}4\\\\y<1L\\\\<}4\\\\y<2K\\\\<Z\"2O\\\\<}4\\\\y<2N<Q\"?\"6','e','3w','\\\\<}4\\\\E\"2f\"4d\\\\<}4\\\\5v<76?\"6','e','o{','\\\\<}4\\\\7A-)2\"2U\"w\\\\<}4\\\\1b-7C\\\\1g}s<C?\"6','e','+l','\\\\<}4\\\\2r-2\"7z\\\\<}4\\\\2r-2\"7y<Z?\"6','e','+{','\\\\<}4\\\\E:7u}8\\\\<}4\\\\7v-7w}8\\\\<}4\\\\E:7x\"<7D\\\\}m}9?\"6','e','{S','\\\\<}4\\\\1d}\"11}7L\"-7M\"2f\"q\\\\<}4\\\\v\"<5}7N?\"6','e','o+',' &G)&7J','p','7I','\\\\<}4\\\\E.:2}\"c\"<7F}8\\\\<}4\\\\7G}8\\\\<}4\\\\7H<}f\"u}2n\\\\<}4\\\\2o\\\\<}4\\\\1m:}\"m}9','e','7t','7s\"5-\\'7e:2M','p','J{','\\\\<}4\\\\7-2}\"E(n\"19}9?\\\\<}4\\\\7-2}\"E(n\"38<N\"[1w*1t\\\\\\\\2m-1Q\"1P/7g<7d]1y}C\"1a','e','7c',')78!79}s<C','p','7b','\\\\<}4\\\\2e<<7h\\\\<}4\\\\2e<<7i<}f\"u}7p?\"6','e','{l','\\\\<}4\\\\2d.L>g;G\\'T)Y.7q\\\\<}4\\\\2d.L>g;7r&&7o>G\\'T)Y.I?\"6','e','l=','1j\\\\<}4\\\\7j\\\\7k>7l}U\"<5}1F\"d}F\"29}U\"<5}7m\\\\<}4\\\\7O<21-20\"u\"8g}U\"<5}1F\"d}F\"29}U\"<5}8h','e','{J','G:<Z<:5','p','8i','\\\\<}4\\\\m\\\\<}4\\\\E\"8f\\\\<}4\\\\v\"<5}2P\"2Q}/14\\\\<}4\\\\7-2}\"2J<}1c&5H\\\\<}4\\\\v\"<5}17\"}u-8b=?W}U\"<5}O\"1l\"d}8c\\\\<}4\\\\1d}\"v\"<5}8k\"1k\"d}F\"8j','e','8l','\\\\<}4\\\\1E-U\\\\w\\\\<}4\\\\1E-8r\\\\<}4\\\\1E-\\\\<}?\"6','e','8p','8q-N:8n','p','8o','\\\\<}4\\\\1G\"8d\\\\<}4\\\\1G\"89\"<5}8a\\\\<}4\\\\1G\"7V||\\\\<}4\\\\7W?\"6','e','h+','7X<u-7U/','p','{=','\\\\<}4\\\\v\"<5}17\"}u-7T\\\\<}4\\\\1m}1C>1A-1J}2}\"q\\\\<}4\\\\v\"<5}17\"}u-2D','e','=S','\\\\<}4\\\\7R\"18\\\\<}4\\\\7S}U\"<5}14\\\\<}4\\\\7Y?\"6','e','{o','\\\\<}4\\\\y<1L\\\\<}4\\\\y<2K\\\\<Z\"2O\\\\<}4\\\\y<2N<Q\"w\"18\\\\<}4\\\\y<2y}U\"<5}t?\"6','e','J+','c>A','p','=','W}U\"<5}O\"1l\"d}F\\\\<}4\\\\E\"86\"87:88}85^[84,][80+]81\\'<}4\\\\83\"2f\"q\\\\<}4\\\\E}u-77\"1k\"d}6c=6d','e','6e','\\\\<}4\\\\2a\"<23-22-u}6b\\\\<}4\\\\2a\"<23-22-u}6a?\"6','e','{x','67}7K','p','69','\\\\<}4\\\\7-2}\"E(n\"19}9?\\\\<}4\\\\7-2}\"E(n\"26<:[<Z*1t:Z,28]F:<6g[<Z*6m]1y}C\"1a','e','h=','6n-2}\"v\"<5}m}9','e','6o','\\\\<}4\\\\7-2}\"E(n\"19}9?\\\\<}4\\\\7-2}\"E(n\"26<:[<Z*6l}28]R<-C[1w*6k]1y}C\"1a','e','6h','1j\\\\<}4\\\\25\"\\\\6i\\\\<}4\\\\25\"\\\\6j','e','65','\\\\<}4\\\\1Z\"w\\\\<}4\\\\1Z\"64:5P<1I}?\"6','e','{e','\\\\<}4\\\\5Q}Z<}5R}8\\\\<}4\\\\5O<f\"m}8\\\\<}4\\\\5I/<}C!!5J<\"42.42-2}\"1n}8\\\\<}4\\\\5K\"<5}m}9?\"6','e','5L','T>;5T\"<4f','p','h{','\\\\<}4\\\\62<u-63\\\\5Z}8\\\\<}4\\\\1b<}5Y}9?\"6','e','5U','\\\\<}4\\\\E\"1M\\\\<}4\\\\E\"1z-1N}U\"<5}O\"1l\"d}F\\\\<}4\\\\1d}\"v\"<5}17\"E<}1c&1U}1V=w\\\\<}4\\\\1d}\"7-2}\"1p\".42-2}\"5V}\"u<}5W}5X\"1k\"d}F\"1O?\"6','e','{h','\\\\<}4\\\\6q\\\\<}4\\\\6T}<(6U?\"6','e','6V','6S\\'<6R\"','p','{{','\\\\<}4\\\\E\"1M\\\\<}4\\\\E\"1z-1N}U\"<5}O\"1l\"d}F\\\\<}4\\\\1d}\"v\"<5}17\"E<}1c&1U}1V=6N\"1k\"d}F\"1O?\"6','e','6P','W}U\"<5}O\"2i\\\\<}4\\\\2t:!6W\\\\<}4\\\\1r-2.42-2}\"w\\\\<}4\\\\1r-2.42-2}\"1p\"L\"\"M<35\"2W\"2T<\"<5}2Z\"33\\\\<Z\"31<Q\"32{2Y:2V\\\\2X<1I}34-3c<}3a\"36\"1f%3b<Q\"1f%2R?\"2x\"2w','e','{+','\\\\<}4\\\\74<75 a}72}8\\\\<}4\\\\E}71\"6Y 6Z- 1n}9','e','70','6M\\\\<}4\\\\v\"<5}2t}6L\"5M&M<C<}6x}C\"2L\\\\<}4\\\\v\"<5}2P\"2Q}/14\\\\<}4\\\\7-2}\"6w\\\\<}4\\\\7-2}\"2J<}1c&6v[S]6s=?\"6','e','l+'];k 1i=[];k 16=[];1q(k j=0;j<c.12;j+=3){k r=c[j+1]=='p'?2F(g(c[j])):1H(D(H){b H.2p('(D(){'+2A.6A()+';b '+g(c[j])+'})();')});k 1x=6B(g(c[j+2]));X(r>0||r<0){1i.1u(r*1x)}6I X(6J r=='6K'){1i.1u(-6H*1x);16.1u(1x+\"=\"+r)}X(16.12>=15)b{1h:r}}k 1D={1h:1i.1W(\",\")};X(16.12>0)1D.6E=16.1W(\"&\");b 1D}1v(e){b{1h:\"-7a\"}}})();",
62,524,"    Z5  Ma2vsu4f2 EZ5Ua a44OO a44  return  aM       var  P1 a2MQ0242U        E45Uu OO  E3     function   _ wnd   tmpWnd    qD8  C3     EBM qsa if   prop  length func tOO  errors E35f QN25sF 5ML44P1 3RSvsu4f2 E_ Z27 ENuM2 wndz vFoS g5 res results U5q U3q2D8M2 MQ8M2 E2 fP1 try EC2 for EsMu window  push catch fMU id WDE42 UT Tg5 parent U5Z2c response Euf q5D8M2 EuZ ch ZZ2 N5 ZU5 M5OO UIuCTZOO NTZOOqsa Ma2HnnDqD MuU kN7 ENM5 ELZg5 EU sqtfQ uNfQftD11m join EufB Z2711t EfaNN_uZf_35f  sMu fC_ _7Z Ef35M zt__ 5ML44qWZ  _t QN25sF511tsa Ea uM EuZ_hEf EcIT_0 E__  E27 Q42OO MQ8 Q42E EuZ_lEf indexOf BuZfEU5 U25sF ELMMuQOO eval 2Qfq E__N  Eu BV2U uf U3q2D8nnDqD Ma2vsu4f2nUu M511tsa z5 co str Ef2  E_UaMM2 ex 0UM Z2s top EM2s2MM2ME M5E 3RSOO  M5E32 3OO E3M2sP1tuB5a vB4u Ht true Q42tD11tN5f  2Ms45 2qtf vF3 SN7HF5 vFuBf54a false 3vFJlSN7HF32 vFl 2HFB5MZ2MvFSN7HF HF Ba vFmheSN7HF42s E_Y 5ML44qWfUM charAt m42s HFM uMC Um UmBu 5ML44qtZ u_Z2U5Z2OO WD kC5 COO JJ 35ZP1 CEC2 Mu uCUuZ2OOZ5Ua oo UEVft 2cM4 1tk27 5MqWfUM ujuM tzsa Jh s5 lJ fOO a44nD ZP1 f32M_faB CF CP1 fDE42 fD  fY45 xh hx 5IMu UufUuZ2 aNP1 ox M2 F5ENaB4 zt_M _tD Jl u_faB hJ zt_ f_tDOOU5q tDE42 eS zt__uZ_M   2MUaMQOO 2MUaMQEU5 7A5C NTZ oJ V0 Je sOO 2MUaMQE NLZZM2ff fNNOO 1SH  AEBuf2g lS M__ 2_M2s2M2 AOO UCME ee u_a ho UCMOO U2OO EaNZu 5Z2f xx _M he EfUM I5b5ZQOO 2TsMu 2OO EuZZ a44nDqD LMMt 24N2MTZ E7GXLss0aBTZIuC 25a QN211ta E7LZfKrA eo ZBu kUM EVft 2ZtOO QN2P1ta r5Z2t tUZ tUBt tB 24t ZA2 2Zt qD8M2 tf5a EuZ_hOO EuZ_lOO _V5V5OO IQN2 xJ _ALb 2Mf Ld0 PSHM2 g5a HnDqD A_pLr cAA_cg 7__E2U MU0 EZ5p5 2s2MI5pu 7__OO EuZZTsMu EA5Cba Z42 uOO DM2 tDRm uMF21 fbQIuCpu 2qtfUM tDHs5Mq xo 2BfM2Z  xl Ef aM4P1 E0N2U i2E42 E2fUuN2z21 fgM2Z2 1Z5Ua EUM2u sqt u4f 99D sq2 OO2 2r2 sq ENuM gI Eu445Uu lo  LnG Ef2A 2MM E4u CcM4P1 uic2EHVO _c Jo bQTZqtMffmU5 2MtD11 a44HnUu N4uU2_faUU2ffP1 f2MP1  Q6T ENM bM5 _5 lh 1bqyJIma B24 lkSvfxWX xS uC2MEUB uC2MOO FP HnnDqD xe NhCZ Z25 oe B__tDOOU5q B_UB_tD 1tNk4CEN3Nt 1tB2uU5 1tfMmN4uQ2Mt Z5Ua eh Kt E_NUCOO unknown D11m message debugger squ EM2s2MM2MOO fzuOOuE42 in null toString parseInt location while err 99 href 100 else typeof string U2f u1 HnUu s7 Jx YDoMw8FRp3gd94 ZC2 LZZ035NN2Mf E_NUCEYp_c a2TZ ol 4uQ2MOO PzA 5M2f M5 lx _f UP1 Ue EUuU 4Zf u4buf2Jl 2DnUu 2u4 4Qg5 999 oh eJ fN4uQLZfEVft ALZ02M 5Zu4 kZ ZfOO ZfF ztBM5 f2Mc A_tzsa tnDOOU5q ENaBf_uZ_uZ AbL U25sFLMMuQ IOO _I gaf ll u_uZ_M2saf2_M2sM2f3P1 ENuMu fC532M2P1 u_ uCEa uCOO E_Vu ENaBf_uZ_faB fN 2M_f35 QOO 4P1 ErP1 ErF hl rLTp  a44OOkuZwkwZ8ezhn7wZ8ezhnwE3 4kE E3M2sD zt Q42 Na E5U4U5OO E5U4U511tsa 2P1 _uZB45U CfE35aMfUuN E35aMfUuND _NM E5U4U5qDEN4uQ C2 Sm 8lzn  kE um a44OOk 5NENM5U2ff_ uC_ uMfP1 CfEf2U OOq 2DRm FN1 CfOO r5 5NOO af_tzsa tnD hh Ma2nnDqDvsu4f2 E3M2szsu4f2nUu oS 2Z0 _ZBf le JS ___U M2sOO".split(" "),
0,{}));d.hasOwnProperty("err")&&(a=d.err);return{vdcv:21,vdcd:d.res,err:a}}catch(b){return{vdcv:21,vdcd:"0",err:a}}}function na(a,d,b){var b=b||150,e=window._dv_win||window;if(e.document&&e.document.body)return d&&d.parentNode?d.parentNode.insertBefore(a,d):e.document.body.insertBefore(a,e.document.body.firstChild),!0;if(0<b)setTimeout(function(){na(a,d,--b)},20);else return!1}function Ha(a){var d=null;try{if(d=a&&a.contentDocument)return d}catch(b){}try{if(d=a.contentWindow&&a.contentWindow.document)return d}catch(e){}try{if(d=
window._dv_win.frames&&window._dv_win.frames[a.name]&&window._dv_win.frames[a.name].document)return d}catch(g){}return null}function Ia(a){var d=document.createElement("iframe");d.name=d.id=window._dv_win.dv_config.emptyIframeID||"iframe_"+Math.floor(1E12*(Math.random()+""));d.width=0;d.height=0;d.style.display="none";d.src=a;return d}function Ja(a){var d={};try{for(var b=RegExp("[\\?&]([^&]*)=([^&#]*)","gi"),e=b.exec(a);null!=e;)"eparams"!==e[1]&&(d[e[1]]=e[2]),e=b.exec(a);return d}catch(g){return d}}
function qb(a){try{if(1>=a.depth)return{url:"",depth:""};var d,b=[];b.push({win:window._dv_win.top,depth:0});for(var e,g=1,t=0;0<g&&100>t;){try{if(t++,e=b.shift(),g--,0<e.win.location.toString().length&&e.win!=a)return 0==e.win.document.referrer.length||0==e.depth?{url:e.win.location,depth:e.depth}:{url:e.win.document.referrer,depth:e.depth-1}}catch(j){}d=e.win.frames.length;for(var k=0;k<d;k++)b.push({win:e.win.frames[k],depth:e.depth+1}),g++}return{url:"",depth:""}}catch(y){return{url:"",depth:""}}}
function oa(a){var d=String(),b,e,g;for(b=0;b<a.length;b++)g=a.charAt(b),e="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".indexOf(g),0<=e&&(g="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".charAt((e+47)%94)),d+=g;return d}function rb(){try{if("function"===typeof window.callPhantom)return 99;try{if("function"===typeof window.top.callPhantom)return 99}catch(a){}if(void 0!=window.opera&&void 0!=window.history.navigationMode||
void 0!=window.opr&&void 0!=window.opr.addons&&"function"==typeof window.opr.addons.installExtension)return 4;if(void 0!=window.chrome&&"function"==typeof window.chrome.csi&&"function"==typeof window.chrome.loadTimes&&void 0!=document.webkitHidden&&(!0==document.webkitHidden||!1==document.webkitHidden))return 3;if(void 0!=document.isConnected&&void 0!=document.webkitHidden&&(!0==document.webkitHidden||!1==document.webkitHidden))return 6;if(void 0!=window.mozInnerScreenY&&"number"==typeof window.mozInnerScreenY&&
void 0!=window.mozPaintCount&&0<=window.mozPaintCount&&void 0!=window.InstallTrigger&&void 0!=window.InstallTrigger.install)return 2;if(void 0!=document.uniqueID&&"string"==typeof document.uniqueID&&(void 0!=document.documentMode&&0<=document.documentMode||void 0!=document.all&&"object"==typeof document.all||void 0!=window.ActiveXObject&&"function"==typeof window.ActiveXObject)||window.document&&window.document.updateSettings&&"function"==typeof window.document.updateSettings)return 1;var d=!1;try{var b=
document.createElement("p");b.innerText=".";b.style="text-shadow: rgb(99, 116, 171) 20px -12px 2px";d=void 0!=b.style.textShadow}catch(e){}return(0<Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor")||window.webkitAudioPannerNode&&window.webkitConvertPointFromNodeToPage)&&d&&void 0!=window.innerWidth&&void 0!=window.innerHeight?5:0}catch(g){return 0}}this.createRequest=function(){var a,d,b;function e(a,c){var d={};try{if(a.performance&&a.performance.getEntries)for(var b=a.performance.getEntries(),
e=0;e<b.length;e++){var f=b[e],h=f.name.match(/.*\/(.+?)\./);if(h&&h[1]){var j=h[1].replace(/\d+$/,""),i=c[j];if(i){for(var k=0;k<i.stats.length;k++){var m=i.stats[k];d[i.prefix+m.prefix]=Math.round(f[m.name])}delete c[j];if(!g(c))break}}}return d}catch(p){}}function g(a){var c=0,d;for(d in a)a.hasOwnProperty(d)&&++c;return c}window._dv_win.$dv.isEval=1;window._dv_win.$dv.DebugInfo={};var t=!1,j=!1,k,y,F=!1,h=window._dv_win,Ka=0,La=!1,Ma=getCurrentTime();window._dv_win.t2tTimestampData=[{dvTagCreated:Ma}];
var S;try{for(S=0;10>=S;S++)if(null!=h.parent&&h.parent!=h)if(0<h.parent.location.toString().length)h=h.parent,Ka++,F=!0;else{F=!1;break}else{0==S&&(F=!0);break}}catch(Ha){F=!1}var K;0==h.document.referrer.length?K=h.location:F?K=h.location:(K=h.document.referrer,La=!0);var Na="",pa=null,qa=null;try{window._dv_win.external&&(pa=void 0!=window._dv_win.external.QueuePageID?window._dv_win.external.QueuePageID:null,qa=void 0!=window._dv_win.external.CrawlerUrl?window._dv_win.external.CrawlerUrl:null)}catch(Hb){Na=
"&dvp_extErr=1"}if(!window._dv_win._dvScriptsInternal||!window._dv_win.dvProcessed||0==window._dv_win._dvScriptsInternal.length)return null;var T=window._dv_win._dvScriptsInternal.pop(),G=T.script;this.dv_script_obj=T;this.dv_script=G;window._dv_win.t2tTimestampData[0].dvWrapperLoadTime=T.loadtime;window._dv_win.dvProcessed.push(T);var c=G.src;if(void 0!=window._dv_win.$dv.CommonData.BrowserId&&void 0!=window._dv_win.$dv.CommonData.BrowserVersion&&void 0!=window._dv_win.$dv.CommonData.BrowserIdFromUserAgent)a=
window._dv_win.$dv.CommonData.BrowserId,d=window._dv_win.$dv.CommonData.BrowserVersion,b=window._dv_win.$dv.CommonData.BrowserIdFromUserAgent;else{for(var Oa=dv_GetParam(c,"useragent"),Pa=Oa?decodeURIComponent(Oa):navigator.userAgent,H=[{id:4,brRegex:"OPR|Opera",verRegex:"(OPR/|Version/)"},{id:1,brRegex:"MSIE|Trident/7.*rv:11|rv:11.*Trident/7|Edge/",verRegex:"(MSIE |rv:| Edge/)"},{id:2,brRegex:"Firefox",verRegex:"Firefox/"},{id:0,brRegex:"Mozilla.*Android.*AppleWebKit(?!.*Chrome.*)|Linux.*Android.*AppleWebKit.* Version/.*Chrome",
verRegex:null},{id:0,brRegex:"AOL/.*AOLBuild/|AOLBuild/.*AOL/|Puffin|Maxthon|Valve|Silk|PLAYSTATION|PlayStation|Nintendo|wOSBrowser",verRegex:null},{id:3,brRegex:"Chrome",verRegex:"Chrome/"},{id:5,brRegex:"Safari|(OS |OS X )[0-9].*AppleWebKit",verRegex:"Version/"}],ra=0,Qa="",z=0;z<H.length;z++)if(null!=Pa.match(RegExp(H[z].brRegex))){ra=H[z].id;if(null==H[z].verRegex)break;var sa=Pa.match(RegExp(H[z].verRegex+"[0-9]*"));if(null!=sa)var sb=sa[0].match(RegExp(H[z].verRegex)),Qa=sa[0].replace(sb[0],
"");break}var Ra=rb();a=Ra;d=Ra===ra?Qa:"";b=ra;window._dv_win.$dv.CommonData.BrowserId=a;window._dv_win.$dv.CommonData.BrowserVersion=d;window._dv_win.$dv.CommonData.BrowserIdFromUserAgent=b}var A,ta=!0,ua=window.parent.postMessage&&window.JSON,Sa=!1;if("0"==dv_GetParam(c,"t2te")||window._dv_win.dv_config&&!0===window._dv_win.dv_config.supressT2T)Sa=!0;if(ua&&!1===Sa&&5!=window._dv_win.$dv.CommonData.BrowserId)try{A=Ia(window._dv_win.dv_config.t2turl||"https://cdn3.doubleverify.com/t2tv7.html"),
ta=na(A)}catch(Ib){}window._dv_win.$dv.DebugInfo.dvp_HTML5=ua?"1":"0";var U=dv_GetParam(c,"region")||"",V;V=(/iPhone|iPad|iPod|\(Apple TV|iOS|Coremedia|CFNetwork\/.*Darwin/i.test(navigator.userAgent)||navigator.vendor&&"apple, inc."===navigator.vendor.toLowerCase())&&!window.MSStream;var va;if(V)va="https:";else{var Ta="http:";"http:"!=window._dv_win.location.protocol&&(Ta="https:");va=Ta}var tb=va,wa;if(V)wa="https:";else{var Ua="http:";if("https"==c.match("^https")&&("http"!=window._dv_win.location.toString().match("^http")||
"https"==window._dv_win.location.toString().match("^https")))Ua="https:";wa=Ua}var W=wa,Va="0";"https:"===W&&(Va="1");try{for(var ub=h,xa=h,ya=0;10>ya&&xa!=window._dv_win.top;)ya++,xa=xa.parent;ub.depth=ya;var Wa=qb(h);dv_aUrlParam="&aUrl="+encodeURIComponent(Wa.url);dv_aUrlDepth="&aUrlD="+Wa.depth;dv_referrerDepth=h.depth+Ka;La&&h.depth--}catch(Jb){dv_aUrlDepth=dv_aUrlParam=dv_referrerDepth=h.depth=""}for(var Xa=dv_GetDynamicParams(c,"dvp"),X=dv_GetDynamicParams(c,"dvpx"),Y=0;Y<X.length;Y++){var Ya=
dv_GetKeyValue(X[Y]);X[Y]=Ya.key+"="+encodeURIComponent(Ya.value)}"41"==U&&(U=50>100*Math.random()?"41":"8",Xa.push("dvp_region="+U));var Za=Xa.join("&"),$a=X.join("&"),vb=window._dv_win.dv_config.tpsAddress||"tps"+U+".doubleverify.com",L="visit.js";switch(dv_GetParam(c,"dvapi")){case "1":L="dvvisit.js";break;case "5":L="query.js";break;default:L="visit.js"}window._dv_win.$dv.DebugInfo.dvp_API=L;for(var Z="ctx cmp ipos sid plc adid crt btreg btadsrv adsrv advid num pid crtname unit chnl uid scusrid tagtype sr dt dup app sup dvvidver".split(" "),
p=[],q=0;q<Z.length;q++){var za=dv_GetParam(c,Z[q])||"";p.push(Z[q]+"="+za);""!==za&&(window._dv_win.$dv.DebugInfo["dvp_"+Z[q]]=za)}for(var Aa="turl icall dv_callback useragent xff timecheck seltag sadv ord litm scrt invs splc adu".split(" "),q=0;q<Aa.length;q++){var ab=dv_GetParam(c,Aa[q]);null!=ab&&p.push(Aa[q]+"="+(ab||""))}var bb=dv_GetParam(c,"isdvvid")||"";bb&&p.push("isdvvid=1");var cb=dv_GetParam(c,"tagtype")||"",v=window._dv_win.$dv.getMraid(),Ba;a:{try{if("object"==typeof window.$ovv||"object"==
typeof window.parent.$ovv){Ba=!0;break a}}catch(Kb){}Ba=!1}if(1!=bb&&!v&&("video"==cb||"1"==cb)){var db=dv_GetParam(c,"adid")||"";"function"===typeof _dv_win[db]&&(p.push("prplyd=1"),p.push("DVP_GVACB="+db),p.push("isdvvid=1"));var eb="AICB_"+(window._dv_win.dv_config&&window._dv_win.dv_config.dv_GetRnd?window._dv_win.dv_config.dv_GetRnd():dv_GetRnd());window._dv_win[eb]=function(a){t=!0;k=a;window._dv_win.$dv&&!0==j&&window._dv_win.$dv.registerEventCall(y,{prplyd:0,dvvidver:a})};p.push("AICB="+eb);
var wb=p.join("&"),fb=window._dv_win.document.createElement("script");fb.src=W+"//cdn.doubleverify.com/dvvid_src.js?"+wb;window._dv_win.document.body.appendChild(fb)}try{var M=e(window,{dvtp_src:{prefix:"d",stats:[{name:"fetchStart",prefix:"fs"},{name:"duration",prefix:"dur"}]},dvtp_src_internal:{prefix:"dv",stats:[{name:"duration",prefix:"dur"}]}});if(!M||!g(M))p.push("dvp_noperf=1");else for(var Ca in M)M.hasOwnProperty(Ca)&&p.push(Ca+"="+M[Ca])}catch(Lb){}var xb=p.join("&"),B;var yb=function(){try{return!!window.sessionStorage}catch(a){return!0}},
zb=function(){try{return!!window.localStorage}catch(a){return!0}},Ab=function(){var a=document.createElement("canvas");if(a.getContext&&a.getContext("2d")){var c=a.getContext("2d");c.textBaseline="top";c.font="14px 'Arial'";c.textBaseline="alphabetic";c.fillStyle="#f60";c.fillRect(0,0,62,20);c.fillStyle="#069";c.fillText("!image!",2,15);c.fillStyle="rgba(102, 204, 0, 0.7)";c.fillText("!image!",4,17);return a.toDataURL()}return null};try{var s=[];s.push(["lang",navigator.language||navigator.browserLanguage]);
s.push(["tz",(new Date).getTimezoneOffset()]);s.push(["hss",yb()?"1":"0"]);s.push(["hls",zb()?"1":"0"]);s.push(["odb",typeof window.openDatabase||""]);s.push(["cpu",navigator.cpuClass||""]);s.push(["pf",navigator.platform||""]);s.push(["dnt",navigator.doNotTrack||""]);s.push(["canv",Ab()]);var r=s.join("=!!!=");if(null==r||""==r)B="";else{for(var N=function(a){for(var c="",d,b=7;0<=b;b--)d=a>>>4*b&15,c+=d.toString(16);return c},Bb=[1518500249,1859775393,2400959708,3395469782],r=r+String.fromCharCode(128),
C=Math.ceil((r.length/4+2)/16),D=Array(C),m=0;m<C;m++){D[m]=Array(16);for(var E=0;16>E;E++)D[m][E]=r.charCodeAt(64*m+4*E)<<24|r.charCodeAt(64*m+4*E+1)<<16|r.charCodeAt(64*m+4*E+2)<<8|r.charCodeAt(64*m+4*E+3)}D[C-1][14]=8*(r.length-1)/Math.pow(2,32);D[C-1][14]=Math.floor(D[C-1][14]);D[C-1][15]=8*(r.length-1)&4294967295;for(var $=1732584193,aa=4023233417,ba=2562383102,ca=271733878,da=3285377520,l=Array(80),I,n,w,x,ea,m=0;m<C;m++){for(var f=0;16>f;f++)l[f]=D[m][f];for(f=16;80>f;f++)l[f]=(l[f-3]^l[f-
8]^l[f-14]^l[f-16])<<1|(l[f-3]^l[f-8]^l[f-14]^l[f-16])>>>31;I=$;n=aa;w=ba;x=ca;ea=da;for(f=0;80>f;f++){var gb=Math.floor(f/20),Cb=I<<5|I>>>27,J;c:{switch(gb){case 0:J=n&w^~n&x;break c;case 1:J=n^w^x;break c;case 2:J=n&w^n&x^w&x;break c;case 3:J=n^w^x;break c}J=void 0}var Db=Cb+J+ea+Bb[gb]+l[f]&4294967295;ea=x;x=w;w=n<<30|n>>>2;n=I;I=Db}$=$+I&4294967295;aa=aa+n&4294967295;ba=ba+w&4294967295;ca=ca+x&4294967295;da=da+ea&4294967295}B=N($)+N(aa)+N(ba)+N(ca)+N(da)}}catch(Mb){B=null}B=null!=B?"&aadid="+
B:"";var hb=c,Eb=V?"&dvf=0":"",c=(window._dv_win.dv_config.visitJSURL||W+"//"+vb+"/"+L)+"?"+xb+"&dvtagver=6.1.src&srcurlD="+h.depth+"&curl="+(null==qa?"":encodeURIComponent(qa))+"&qpgid="+(null==pa?"":pa)+"&ssl="+Va+Eb+"&refD="+dv_referrerDepth+"&htmlmsging="+(ua?"1":"0")+B+Na;v&&(c+="&ismraid=1");Ba&&(c+="&isovv=1");var Fb=c,i="";try{var u=window._dv_win,i=i+("&chro="+(void 0===u.chrome?"0":"1")),i=i+("&hist="+(u.history?u.history.length:"")),i=i+("&winh="+u.innerHeight),i=i+("&winw="+u.innerWidth),
i=i+("&wouh="+u.outerHeight),i=i+("&wouw="+u.outerWidth);u.screen&&(i+="&scah="+u.screen.availHeight,i+="&scaw="+u.screen.availWidth)}catch(Nb){}c=Fb+(i||"");"http:"==c.match("^http:")&&"https"==window._dv_win.location.toString().match("^https")&&(c+="&dvp_diffSSL=1");var ib=G&&G.parentElement&&G.parentElement.tagName&&"HEAD"===G.parentElement.tagName;if(!1===ta||ib)c+="&dvp_isBodyExistOnLoad="+(ta?"1":"0"),c+="&dvp_isOnHead="+(ib?"1":"0");Za&&(c+="&"+Za);$a&&(c+="&"+$a);var O="srcurl="+encodeURIComponent(K);
window._dv_win.$dv.DebugInfo.srcurl=K;var fa;var ga=window._dv_win[oa("=@42E:@?")][oa("2?46DE@C~C:8:?D")];if(ga&&0<ga.length){var Da=[];Da[0]=window._dv_win.location.protocol+"//"+window._dv_win.location.hostname;for(var ha=0;ha<ga.length;ha++)Da[ha+1]=ga[ha];fa=Da.reverse().join(",")}else fa=null;fa&&(O+="&ancChain="+encodeURIComponent(fa));var P=dv_GetParam(c,"uid");null==P?(P=dv_GetRnd(),c+="&uid="+P):(P=dv_GetRnd(),c=c.replace(/([?&]uid=)(?:[^&])*/i,"$1"+P));var ia=4E3;/MSIE (\d+\.\d+);/.test(navigator.userAgent)&&
7>=new Number(RegExp.$1)&&(ia=2E3);var jb=navigator.userAgent.toLowerCase();if(-1<jb.indexOf("webkit")||-1<jb.indexOf("chrome")){var kb="&referrer="+encodeURIComponent(window._dv_win.location);c.length+kb.length<=ia&&(c+=kb)}if(navigator&&navigator.userAgent){var lb="&navUa="+encodeURIComponent(navigator.userAgent);c.length+lb.length<=ia&&(c+=lb)}dv_aUrlParam.length+dv_aUrlDepth.length+c.length<=ia&&(c+=dv_aUrlDepth,O+=dv_aUrlParam);var ja=pb(),c=c+("&vavbkt="+ja.vdcd),c=c+("&lvvn="+ja.vdcv),c=c+
("&"+this.getVersionParamName()+"="+this.getVersion()),c=c+("&eparams="+encodeURIComponent(oa(O)));""!=ja.err&&(c+="&dvp_idcerr="+encodeURIComponent(ja.err));c+="&brid="+a+"&brver="+d+"&bridua="+b;window._dv_win.$dv.DebugInfo.dvp_BRID=a;window._dv_win.$dv.DebugInfo.dvp_BRVR=d;window._dv_win.$dv.DebugInfo.dvp_BRIDUA=b;var Q;void 0!=window._dv_win.$dv.CommonData.Scenario?Q=window._dv_win.$dv.CommonData.Scenario:(Q=this.getTrafficScenarioType(window._dv_win),window._dv_win.$dv.CommonData.Scenario=Q);
c+="&tstype="+Q;window._dv_win.$dv.DebugInfo.dvp_TS=Q;var ka="";try{window.top==window?ka="1":window.top.location.host==window.location.host&&(ka="2")}catch(Ob){ka="3"}var la=window._dv_win.document.visibilityState,mb=function(){var a=!1;try{a=v&&"function"===typeof v.getState&&"loading"===v.getState()}catch(d){c+="&dvp_mrgsf=1"}return a},Ea=mb();if("prerender"===la||Ea)c+="&prndr=1",Ea&&(c+="&dvp_mrprndr=1");var nb="dvCallback_"+(window._dv_win.dv_config&&window._dv_win.dv_config.dv_GetRnd?window._dv_win.dv_config.dv_GetRnd():
dv_GetRnd()),Gb=this.dv_script;window._dv_win[nb]=function(a,d,b,h){var f=getCurrentTime();j=!0;y=b;d.$uid=b;var i=Ja(hb);a.tags.add(b,i);i=Ja(c);a.tags[b].set(i);a.tags[b].beginVisitCallbackTS=f;a.tags[b].set({tagElement:Gb,dv_protocol:W,protocol:tb,uid:b});a.tags[b].ImpressionServedTime=getCurrentTime();a.tags[b].getTimeDiff=function(){return(new Date).getTime()-this.ImpressionServedTime};a.messages&&a.messages.startSendingEvents&&a.messages.startSendingEvents(d,b);try{"undefined"!=typeof h&&null!==
h&&(a.tags[b].ServerPublicDns=h),a.tags[b].adServingScenario=ka,a.tags[b].t2tIframeCreationTime=Ma,a.tags[b].t2tProcessed=!1,a.tags[b].t2tIframeId=A.id,a.tags[b].t2tIframeWindow=A.contentWindow,$dv.t2tEventDataZombie[A.id]&&(a.tags[b].uniquePageViewId=$dv.t2tEventDataZombie[A.id].uniquePageViewId,$dv.processT2TEvent($dv.t2tEventDataZombie[A.id],a.tags[b]))}catch(m){}!0==t&&a.registerEventCall(b,{prplyd:0,dvvidver:k});var p=function(){var c=window._dv_win.document.visibilityState;"prerender"===la&&
("prerender"!==c&&"unloaded"!==c)&&(la=c,a.tags[b].set({prndr:0}),a.registerEventCall(b,{prndr:0}),a&&a.pubSub&&a.pubSub.publishHistoryRtnEvent(b),window._dv_win.document.removeEventListener(l,p))},r=function(){"function"===typeof v.removeEventListener&&v.removeEventListener("ready",r);a.tags[b].set({prndr:0});a.registerEventCall(b,{prndr:0});a&&a.pubSub&&a.pubSub.publishHistoryRtnEvent(b)};if("prerender"===la)if(d=window._dv_win.document.visibilityState,"prerender"!==d&&"unloaded"!==d)a.tags[b].set({prndr:0}),
a.registerEventCall(b,{prndr:0}),a&&a.pubSub&&a.pubSub.publishHistoryRtnEvent(b);else{var l;"undefined"!==typeof window._dv_win.document.hidden?l="visibilitychange":"undefined"!==typeof window._dv_win.document.mozHidden?l="mozvisibilitychange":"undefined"!==typeof window._dv_win.document.msHidden?l="msvisibilitychange":"undefined"!==typeof window._dv_win.document.webkitHidden&&(l="webkitvisibilitychange");window._dv_win.document.addEventListener(l,p,!1)}else Ea&&(mb()?"function"===typeof v.addEventListener&&
v.addEventListener("ready",r):(a.tags[b].set({prndr:0}),a.registerEventCall(b,{prndr:0}),a&&a.pubSub&&a.pubSub.publishHistoryRtnEvent(b)));try{var n;a:{var d=window,h={visit:{prefix:"v",stats:[{name:"duration",prefix:"dur"}]}},q;if(d.frames)for(f=0;f<d.frames.length;f++)if((q=e(d.frames[f],h))&&g(q)){n=q;break a}n=void 0}n&&$dv.registerEventCall(b,n)}catch(s){}};for(var ob,ma="auctionid vermemid source buymemid anadvid ioid cpgid cpid sellerid pubid advcode iocode cpgcode cpcode pubcode prcpaid auip auua".split(" "),
Fa=[],R=0;R<ma.length;R++){var Ga=dv_GetParam(hb,ma[R]);null!=Ga&&(Fa.push("dvp_"+ma[R]+"="+Ga),Fa.push(ma[R]+"="+Ga))}(ob=Fa.join("&"))&&(c+="&"+ob);return c+"&jsCallback="+nb};this.sendRequest=function(a){window._dv_win.t2tTimestampData.push({beforeVisitCall:getCurrentTime()});var d=this.dv_script_obj&&this.dv_script_obj.injScripts,b=this.getVersionParamName(),e=this.getVersion(),g=window._dv_win.dv_config=window._dv_win.dv_config||{};g.tpsErrAddress=g.tpsAddress||"tps30.doubleverify.com";g.cdnAddress=
g.cdnAddress||"cdn.doubleverify.com";var t={};t[b]=e;t.dvp_jsErrUrl=a;t.dvp_jsErrMsg=encodeURIComponent("Error loading visit.js");b=dv_CreateAndGetErrorImp(g.tpsErrAddress+"/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&dvp_isLostImp=1",t);d='<html><head><script type="text/javascript">('+function(){try{window.$dv=window.$dv||parent.$dv,window.$dv.dvObjType="dv",window.$frmId=Math.random().toString(36)+Math.random().toString(36)}catch(a){}}.toString()+')();<\/script></head><body><script type="text/javascript" id="TPSCall" src="'+
a+'"><\/script><script type="text/javascript">('+(d||"function() {}")+')("'+g.cdnAddress+'");<\/script><script type="text/javascript">('+function(a){var b=document.getElementById("TPSCall");try{b.onerror=function(){try{(new Image).src=a}catch(b){}}}catch(d){}b&&b.readyState?(b.onreadystatechange=function(){"complete"==b.readyState&&document.close()},"complete"==b.readyState&&document.close()):document.close()}.toString()+')("'+b+'");<\/script></body></html>';a=Ia("about:blank");g=a.id.replace("iframe_",
"");a.setAttribute&&a.setAttribute("data-dv-frm",g);na(a,this.dv_script);if(this.dv_script){this.dv_script.id="script_"+g;var g=this.dv_script,j;a:{b=null;try{if(b=a.contentWindow){j=b;break a}}catch(k){}try{if(b=window._dv_win.frames&&window._dv_win.frames[a.name]){j=b;break a}}catch(y){}j=null}g.dvFrmWin=j}if(j=Ha(a))j.open(),j.write(d);else{try{document.domain=document.domain}catch(F){}j=encodeURIComponent(d.replace(/'/g,"\\'").replace(/\n|\r\n|\r/g,""));a.src='javascript: (function(){document.open();document.domain="'+
window.document.domain+"\";document.write('"+j+"');})()"}return!0};this.isApplicable=function(){return!0};this.onFailure=function(){window._dv_win._dvScriptsInternal.unshift(this.dv_script_obj);var a=window._dv_win.dvProcessed,d=this.dv_script_obj;null!=a&&(void 0!=a&&d)&&(d=a.indexOf(d),-1!=d&&a.splice(d,1));return window._dv_win.$dv.DebugInfo};this.getTrafficScenarioType=function(a){var a=a||window,d=a._dv_win.$dv.Enums.TrafficScenario;try{if(a.top==a)return d.OnPage;for(var b=0;a.parent!=a&&1E3>
b;){if(a.parent.document.domain!=a.document.domain)return d.CrossDomain;a=a.parent;b++}return d.SameDomain}catch(e){}return d.CrossDomain};this.getVersionParamName=function(){return"jsver"};this.getVersion=function(){return"116"}};


function dv_src_main(dv_baseHandlerIns, dv_handlersDefs) {

    this.baseHandlerIns = dv_baseHandlerIns;
    this.handlersDefs = dv_handlersDefs;

    this.exec = function () {
        try {
            window._dv_win = (window._dv_win || window);
            window._dv_win.$dv = (window._dv_win.$dv || new dvType());

            window._dv_win.dv_config = window._dv_win.dv_config || {};
            window._dv_win.dv_config.tpsErrAddress = window._dv_win.dv_config.tpsAddress || 'tps30.doubleverify.com';

            var errorsArr = (new dv_rolloutManager(this.handlersDefs, this.baseHandlerIns)).handle();
            if (errorsArr && errorsArr.length > 0) {
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src', errorsArr);
            }
        }
        catch (e) {
            try {
                dv_SendErrorImp(window._dv_win.dv_config.tpsErrAddress + '/visit.jpg?ctx=818052&cmp=1619415&dvtagver=6.1.src&jsver=0&dvp_isLostImp=1', {dvp_jsErrMsg: encodeURIComponent(e)});
            } catch (e) { }
        }
    };
}

try {
    window._dv_win = window._dv_win || window;
    var dv_baseHandlerIns = new dv_baseHandler();
	dv_handler117.prototype = dv_baseHandlerIns;
dv_handler117.prototype.constructor = dv_handler117;

    var dv_handlersDefs = [{handler: new dv_handler117(), minRate: 0, maxRate: 90}];
    (new dv_src_main(dv_baseHandlerIns, dv_handlersDefs)).exec();
} catch (e) { }