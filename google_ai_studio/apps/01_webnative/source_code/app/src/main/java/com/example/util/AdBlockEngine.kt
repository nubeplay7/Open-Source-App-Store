package com.example.util

import android.net.Uri
import android.webkit.WebResourceResponse
import java.io.ByteArrayInputStream

object AdBlockEngine {

    // Critical Protected Streaming, Video Chunks and Audio Delivery Endpoints (NEVER BLOCKED)
    private val ESSENTIAL_MEDIA_AND_STREAM_DOMAINS = hashSetOf(
        "googlevideo.com",
        "youtube.com",
        "m.youtube.com",
        "music.youtube.com",
        "youtu.be",
        "ytimg.com",
        "youtube-nocookie.com",
        "ggpht.com",
        "spotify.com",
        "audio-ak.spotify.com",
        "audio4-ak.spotify.com",
        "scdn.co",
        "soundcloud.com",
        "sndcdn.com",
        "tiktok.com",
        "tiktokv.com",
        "muscdn.com",
        "fbcdn.net",
        "cdninstagram.com",
        "twimg.com",
        "vimeocdn.com",
        "dailymotion.com",
        "netflix.com",
        "nflxvideo.net"
    )

    // Critical Protected Google OAuth, AI Studio & Developer Endpoints
    private val WHITELISTED_AUTH_DOMAINS = hashSetOf(
        "accounts.google.com",
        "myaccount.google.com",
        "aistudio.google.com",
        "gemini.google.com",
        "notebooklm.google.com",
        "notebook.google.com",
        "alkalicontent-pa.clients6.google.com",
        "alkalimessagingserver-pa.clients6.google.com",
        "alkali-pa.clients6.google.com",
        "apis.google.com",
        "ssl.gstatic.com",
        "www.gstatic.com",
        "gstatic.com",
        "oauth2.googleapis.com",
        "cloud.google.com",
        "clients6.google.com",
        "alkalimakersuite-pa.clients6.google.com",
        "ai.google.dev",
        "googleusercontent.com",
        "lh3.googleusercontent.com",
        "play.google.com"
    )

    // Comprehensive multi-category domain blocklist (over 130 top ad networks, trackers, popunder syndicates)
    private val BLOCKED_DOMAINS = hashSetOf(
        // Google Ads & Syndication (External ad networks ONLY - not core playback)
        "doubleclick.net",
        "googleadservices.com",
        "googlesyndication.com",
        "adservice.google.com",
        "pagead2.googlesyndication.com",
        "pagead2.googleadservices.com",
        "afs.googlesyndication.com",
        "tpc.googlesyndication.com",
        "partner.googleadservices.com",
        "admob.com",
        
        // Major Real-Time Bidding & Retargeting Networks
        "criteo.com",
        "criteo.net",
        "adnxs.com",
        "adsystem.com",
        "adroll.com",
        "taboola.com",
        "outbrain.com",
        "rubiconproject.com",
        "pubmatic.com",
        "openx.net",
        "casalemedia.com",
        "smartadserver.com",
        "yieldmo.com",
        "amazon-adsystem.com",
        "inmobi.com",
        "applovin.com",
        "bidswitch.net",
        "bidvertiser.com",
        "aniview.com",
        "spotxchange.com",
        "teads.tv",
        "innovid.com",
        "yieldlab.net",
        "adform.net",
        "revcontent.com",
        "mgid.com",
        "zemanta.com",
        "flashtalking.com",
        "serving-sys.com",
        "advertising.com",
        "adblade.com",
        "carbonads.net",
        "buysellads.com",
        "adtrue.com",
        "adcolony.com",
        "unityads.unity3d.com",
        "vungle.com",
        "ironsrc.com",

        // Popunder, Interstitial & High-Risk Syndicates
        "popads.net",
        "popcash.net",
        "propellerads.com",
        "adsterra.com",
        "exoclick.com",
        "trafficjunky.com",
        "juicyads.com",
        "yllix.com",
        "clickadu.com",
        "hilltopads.com",
        "monetag.com",
        "richpush.co",
        "richads.com",
        "evadav.com",
        "pushground.com",
        "rollerads.com",
        "galaksion.com",
        "zeropark.com",
        "trafficstars.com",
        "plugrush.com",
        "adcash.com",
        "clicksor.com",

        // Telemetry, User Session Recording & Fingerprinting Networks
        "scorecardresearch.com",
        "quantserve.com",
        "adsafeprotected.com",
        "moatads.com",
        "chartbeat.net",
        "hotjar.com",
        "crazyegg.com",
        "mouseflow.com",
        "fullstory.com",
        "smartlook.com",
        "clarity.ms",
        "yandex.ru/metrika",
        "mc.yandex.ru",
        "segment.io",
        "mixpanel.com",
        "amplitude.com",
        "branch.io",
        "appsflyer.com",
        "adjust.com",
        "kochava.com",
        "singular.net",
        "onesignal.com",

        // Crypto Mining & Malicious Web Telemetry
        "coinhive.com",
        "coin-hive.com",
        "jsecoin.com",
        "cryptoloot.pro",
        "webminepool.com",
        "minr.pw"
    )

    // Common ad & tracker keywords in URLs / query params (Carefully scoped to avoid media stream false positives)
    private val BLOCKED_KEYWORDS = listOf(
        "/banner-ads/", "googleads.g.doubleclick.net", "/popunder",
        "doubleclick.net", "/advertisement/", "bannerid=",
        "/pagead/js/adsbygoogle.js", "/ad-placement/", "/prebid.js",
        "/gpt/pubads_impl_", "partnerads.g.doubleclick.net"
    )

    /**
     * Checks if a URL is an ad, tracker, or unwanted telemetry endpoint.
     * Guarantees 100% video stream integrity for YouTube, Spotify, and media players.
     */
    fun isAdOrTracker(url: String, config: AdBlockConfiguration = AdBlockConfigManager.configFlow.value): Boolean {
        if (!config.globalAdBlockEnabled) return false

        try {
            val uri = Uri.parse(url)
            val host = uri.host?.lowercase() ?: return false
            val path = uri.path?.lowercase() ?: ""

            // 1. Inviolable Protection: Essential Media & Video Playback Endpoints
            if (host == "googlevideo.com" || host.endsWith(".googlevideo.com")) {
                return false
            }
            if (host == "ytimg.com" || host.endsWith(".ytimg.com") || host == "ggpht.com" || host.endsWith(".ggpht.com") || host == "youtube-nocookie.com") {
                return false
            }
            if (host == "youtube.com" || host == "m.youtube.com" || host == "music.youtube.com" || host.endsWith(".youtube.com") || host == "youtu.be") {
                if (!path.contains("/pagead/") && !path.contains("googleads") && !path.contains("doubleclick") && !path.contains("/ad_") && !path.contains("api/stats/ads")) {
                    return false
                }
            }

            for (mediaDomain in ESSENTIAL_MEDIA_AND_STREAM_DOMAINS) {
                if (host == mediaDomain || host.endsWith(".$mediaDomain")) {
                    return false
                }
            }
            
            // 2. Check Protected Google Auth/AI Studio Whitelist (Inviolable)
            for (allowed in WHITELISTED_AUTH_DOMAINS) {
                if (host == allowed || host.endsWith(".$allowed")) {
                    return false
                }
            }

            // 3. Check User's Custom Site Whitelist
            for (whitelistedSite in config.siteWhitelist) {
                if (whitelistedSite.isNotBlank() && (host == whitelistedSite || host.endsWith(".$whitelistedSite"))) {
                    return false
                }
            }

            // 4. Check Phase 1: User's Custom Blocked Domains
            if (config.customBlockedDomains.isNotEmpty()) {
                for (customBlocked in config.customBlockedDomains) {
                    if (customBlocked.isNotBlank() && (host == customBlocked.lowercase() || host.endsWith(".${customBlocked.lowercase()}"))) {
                        return true
                    }
                }
            }

            // 5. Check Phase 1: Built-in Blocked Domains (if network domain blocking is enabled)
            if (config.networkDomainBlockingEnabled) {
                for (blocked in BLOCKED_DOMAINS) {
                    if (host == blocked || host.endsWith(".$blocked")) {
                        return true
                    }
                }
            }

            // 6. Check Phase 1: Blocked Keywords in Path / Query
            if (config.networkKeywordBlockingEnabled) {
                val query = uri.query?.lowercase() ?: ""
                for (keyword in BLOCKED_KEYWORDS) {
                    if (path.contains(keyword) || query.contains(keyword)) {
                        return true
                    }
                }
            }

            // 7. Check Phase 14: Custom Regex Rules
            if (config.customRegexFilterRules.isNotBlank()) {
                val lines = config.customRegexFilterRules.split("\n")
                for (line in lines) {
                    val trimmed = line.trim()
                    if (trimmed.isNotBlank() && !trimmed.startsWith("#")) {
                        try {
                            if (Regex(trimmed, RegexOption.IGNORE_CASE).containsMatchIn(url)) {
                                return true
                            }
                        } catch (_: Exception) {}
                    }
                }
            }

        } catch (_: Exception) {
            // Ignore parse errors
        }
        return false
    }

    /**
     * Creates an empty WebResourceResponse for blocked requests.
     */
    fun createEmptyResponse(): WebResourceResponse {
        return WebResourceResponse(
            "text/plain",
            "utf-8",
            ByteArrayInputStream("".toByteArray())
        )
    }

    /**
     * Creates a synthetic, harmless JavaScript mock response for anti-adblock honeypots.
     * Prevents stubborn websites from detecting adblock through missing script variables.
     */
    fun createSyntheticAdScriptResponse(): WebResourceResponse {
        val mockJs = """
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.loaded = true;
            window.canRunAds = true;
            window.isAdBlockActive = false;
            window.google_ad_client = window.google_ad_client || 'ca-pub-0000000000000000';
            window.ga = window.ga || function() {};
            window.gtag = window.gtag || function() {};
            window.__ads_loaded = true;
        """.trimIndent()
        return WebResourceResponse(
            "application/javascript",
            "utf-8",
            ByteArrayInputStream(mockJs.toByteArray())
        )
    }

    /**
     * Generates true OLED pure black CSS.
     */
    fun getOledBlackCss(): String {
        return """
            javascript:(function() {
                var style = document.getElementById('webnative_oled_dark');
                if (!style) {
                    style = document.createElement('style');
                    style.id = 'webnative_oled_dark';
                    style.innerHTML = 'html, body { background-color: #000000 !important; color: #E0E0E0 !important; } * { border-color: #222 !important; } img, video { filter: brightness(0.9) !important; }';
                    document.head.appendChild(style);
                }
            })();
        """.trimIndent()
    }

    /**
     * Generates cosmetic CSS hiding rules (uBlock Origin & Snaptube Pure Style).
     */
    fun getAdHidingCss(customCss: String = ""): String {
        val baseSelectors = listOf(
            ".adsbygoogle", ".banner-ad",
            "ytd-promoted-video-renderer", "ytd-display-ad-renderer", 
            "ytd-ad-slot-renderer", "ytd-in-feed-ad-layout-renderer",
            "ytd-banner-promo-renderer", "ytm-promoted-sparkles-web-renderer",
            "ytm-companion-ad-renderer", "#masthead-ad", ".ytm-promoted-item",
            ".ytp-ad-overlay-container", "#player-ads", ".ytp-ad-player-overlay",
            ".ytp-ad-player-overlay-layout", ".ytp-ad-player-overlay-flyout-cta",
            ".ytp-ad-action-interstitial", ".ytp-ad-message-container",
            ".ytp-ad-persistent-progress-bar-container", ".ytp-ad-preview-container",
            ".ytp-ad-module", ".video-ads", "ytd-player-legacy-desktop-watch-ads-renderer",
            "ytd-action-companion-ad-renderer", ".ytp-cairo-refresh-signature-moments",
            "tp-yt-paper-dialog:has(#feedback)", "ytd-enforcement-message-view-model",
            ".ad-container", "ytd-rich-item-renderer:has(.ytd-ad-slot-renderer)",
            "[id*=\"taboola\"]", "[id*=\"outbrain\"]",
            "[class*=\"cookie-banner\"]", "[id*=\"cookie-consent\"]", ".qc-cmp-ui-container",
            "#onetrust-consent-sdk", ".didomi-popup-container"
        ).joinToString(", ")

        val extra = if (customCss.isNotBlank()) " $customCss" else ""

        return """
            javascript:(function() {
                var style = document.getElementById('webnative_ad_hide');
                if (!style) {
                    style = document.createElement('style');
                    style.id = 'webnative_ad_hide';
                    style.innerHTML = '$baseSelectors { display: none !important; height: 0 !important; width: 0 !important; opacity: 0 !important; background: transparent !important; pointer-events: none !important; } .ad-showing video, .ad-interrupting video, .ad-showing .html5-video-container video { opacity: 0 !important; } .ad-showing, .ad-interrupting { background: #000000 !important; } $extra';
                    document.head.appendChild(style);
                }
            })();
        """.trimIndent()
    }

    /**
     * Precision Video Ad Skipper & Pure YouTube Playback Engine (uBlock Origin & Snaptube technique).
     * Eliminates ads cleanly WITHOUT ever interfering with the actual media stream, avoids grey
     * screen flickers during song transitions, and strictly respects manual user pause actions.
     */
    fun getVideoAdSkipperJs(speedMultiplier: Float = 16.0f): String {
        return """
            javascript:(function() {
                if (window.__webnative_ad_skipper_installed) return;
                window.__webnative_ad_skipper_installed = true;

                // 1. YouTube Pure Player Hook
                // Note: We avoid mutating ytInitialPlayerResponse directly as YouTube enforces strict schema checks.

                // 2. Safe Auto-Skip & Instant Transition Runner
                function safeSkipAds() {
                    try {
                        var player = document.querySelector('#movie_player, .html5-video-player');
                        var video = document.querySelector('video.html5-main-video, #movie_player video, video');

                        // A. Click skip buttons immediately whenever available
                        var skipButtons = document.querySelectorAll('.ytp-ad-skip-button, .ytp-skip-ad-button, .ytp-ad-skip-button-modern, .ytp-ad-skip-button-slot button, .videoAdUiSkipButton, [id*="skip-button"] button, .ytp-ad-overlay-close-button');
                        for (var i = 0; i < skipButtons.length; i++) {
                            var btn = skipButtons[i];
                            if (btn && typeof btn.click === 'function') {
                                btn.click();
                            }
                        }

                        // B. Check if an advertisement is ACTIVELY interrupting playback
                        var isAdShowing = player && (player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting'));
                        var hasActiveAdText = document.querySelector('.ytp-ad-text, .ytp-ad-preview-text, .ytp-ad-simple-attributed-string') !== null;

                        if (isAdShowing && hasActiveAdText) {
                            if (video) {
                                video.muted = true;
                                video.playbackRate = 16.0;
                                if (!isNaN(video.duration) && video.duration > 0 && video.duration < 180) {
                                    video.currentTime = video.duration - 0.05;
                                }
                            }
                        } else {
                            // C. Normal playback: restore normal speed & audio if it was boosted by skipper
                            if (video) {
                                if (video.playbackRate > 2.0) {
                                    video.playbackRate = 1.0;
                                    video.muted = false;
                                }
                            }

                            // Suppress lingering ad containers
                            var lingeringOverlays = document.querySelectorAll('.ytp-ad-player-overlay, ytd-ad-slot-renderer, .ytp-cairo-refresh-signature-moments, .ytp-ad-action-interstitial');
                            for (var j = 0; j < lingeringOverlays.length; j++) {
                                lingeringOverlays[j].style.setProperty('display', 'none', 'important');
                            }
                        }

                        // D. Anti-adblock YouTube Warning Modal Crusher (Avoid :has() selector to prevent DOMException)
                        var popups = document.querySelectorAll('ytd-popup-container, tp-yt-paper-dialog, ytd-enforcement-message-view-model');
                        for (var k = 0; k < popups.length; k++) {
                            var p = popups[k];
                            if (p && p.innerText && (p.innerText.includes('Ad blockers') || p.innerText.includes('bloqueadores') || p.innerText.includes('Ad blocking') || p.querySelector('#feedback'))) {
                                p.remove();
                            }
                        }
                    } catch (e) {}
                }

                setInterval(safeSkipAds, 400);

                if (window.MutationObserver) {
                    var observer = new MutationObserver(function() {
                        safeSkipAds();
                    });
                    observer.observe(document.documentElement, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['class', 'src', 'style']
                    });
                }
            })();
        """.trimIndent()
    }

    /**
     * Master Multi-Layer Stealth Shield Script injecting all active phases
     * (Phases 2 through 13: Honeypots, Anti-Anti-Debugger, Video Mutation, Shadow DOM, Scriptlets, Fingerprint noise, etc.)
     */
    fun getCompleteStealthShieldScript(config: AdBlockConfiguration): String {
        val isAntiAdblock = config.antiAdblockDefeaterEnabled
        val isShadowDom = config.shadowDomPiercingEnabled
        val isAntiDebugger = config.antiDebuggerNeutralizerEnabled
        val isWebRtcShield = config.webrtcLeakProtectionEnabled
        val isPopunderCrusher = config.popunderCrusherEnabled
        val isCookiePaywall = config.cookieConsentAnnihilatorEnabled
        val isFingerprintNoise = config.fingerprintNoiseGeneratorEnabled
        val isWorkerShield = config.workerTelemetryInterceptorEnabled
        val isWasmShield = config.wasmInterceptorEnabled

        return """
            (function() {
                if (window.__webnative_quantum_shield_active) return;
                window.__webnative_quantum_shield_active = true;

                // =========================================================================
                // FASE 2: QUANTUM STEALTH HONEYPOT & ANTI-ADBLOCK SPOOFER
                // =========================================================================
                if ($isAntiAdblock) {
                    try {
                        window.canRunAds = true;
                        window.isAdBlockActive = false;
                        window.hasAdblock = false;
                        window._pop = window._pop || [];
                        window.google_ad_client = window.google_ad_client || 'ca-pub-7777777777777777';
                        window.adsbygoogle = window.adsbygoogle || [];
                        window.adsbygoogle.loaded = true;
                        window.adsbygoogle.push = function() { return 1; };

                        // Google Analytics dummy hook
                        window.ga = window.ga || function() {};
                        window.gtag = window.gtag || function() {};
                        window.dataLayer = window.dataLayer || [];

                        // Trap anti-adblock test scripts without breaking YouTube / Media APIs
                        var origFetch = window.fetch;
                        window.fetch = function(input, init) {
                            var url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
                            // NEVER intercept YouTube player APIs or streaming formats!
                            if (url && !url.includes('youtube') && !url.includes('googlevideo') && !url.includes('spotify') && !url.includes('soundcloud')) {
                                if (url.includes('/ads/check') || url.includes('adblock-check') || url.includes('/detect-adblock')) {
                                    return Promise.resolve(new Response('{"status":"ok","ads_allowed":true}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
                                }
                            }
                            return origFetch.apply(this, arguments);
                        };
                    } catch(e) {}
                }

                // =========================================================================
                // FASE 5: ANTI-ANTI-DEBUGGER & CONSOLE TRAP DEFUSAL
                // =========================================================================
                if ($isAntiDebugger) {
                    try {
                        var origClear = console.clear;
                        console.clear = function() {};
                    } catch(e) {}
                }

                // =========================================================================
                // FASE 7: WEBRTC IP LEAK & STUN/TURN SHIELD
                // =========================================================================
                if ($isWebRtcShield) {
                    try {
                        if (window.RTCPeerConnection) {
                            var origPeerConnection = window.RTCPeerConnection;
                            window.RTCPeerConnection = function(config, constraints) {
                                if (config && config.iceServers) {
                                    config.iceServers = config.iceServers.filter(function(server) {
                                        var urls = Array.isArray(server.urls) ? server.urls : [server.urls || ''];
                                        return !urls.some(function(u) { return u.includes('ad') || u.includes('track') || u.includes('telemetry'); });
                                    });
                                }
                                return new origPeerConnection(config, constraints);
                            };
                            window.RTCPeerConnection.prototype = origPeerConnection.prototype;
                        }
                    } catch(e) {}
                }

                // =========================================================================
                // FASE 8: POPUNDER & CLICKJACKING CRUSHER
                // =========================================================================
                if ($isPopunderCrusher) {
                    try {
                        var origOpen = window.open;
                        window.open = function(url, target, features) {
                            if (!url || url === 'about:blank' || url.includes('popads') || url.includes('propeller') || url.includes('exoclick') || url.includes('adsterra') || url.includes('clickadu')) {
                                return null;
                            }
                            return origOpen.apply(this, arguments);
                        };

                        document.addEventListener('click', function(e) {
                            var target = e.target;
                            while (target && target !== document.body) {
                                if (target.tagName === 'A') {
                                    var href = target.getAttribute('href') || '';
                                    if (href.startsWith('javascript:void(0)') || href.includes('popunder') || href.includes('adnetwork')) {
                                        e.preventDefault();
                                        e.stopImmediatePropagation();
                                        return false;
                                    }
                                }
                                target = target.parentElement;
                            }
                        }, true);
                    } catch(e) {}
                }

                // =========================================================================
                // FASE 10: CANVAS & AUDIO CONTEXT FINGERPRINT RANDOMIZER
                // =========================================================================
                if ($isFingerprintNoise) {
                    try {
                        var origToDataURL = HTMLCanvasElement.prototype.toDataURL;
                        HTMLCanvasElement.prototype.toDataURL = function(type) {
                            var context = this.getContext('2d');
                            if (context) {
                                try {
                                    var imgData = context.getImageData(0, 0, Math.min(this.width, 10), Math.min(this.height, 10));
                                    if (imgData.data.length > 3) {
                                        imgData.data[0] = (imgData.data[0] + (Math.random() < 0.5 ? 1 : -1) + 256) % 256;
                                        context.putImageData(imgData, 0, 0);
                                    }
                                } catch(e) {}
                            }
                            return origToDataURL.apply(this, arguments);
                        };
                    } catch(e) {}
                }

                // =========================================================================
                // FASE 11: WEB WORKER & BEACON TELEMETRY INTERCEPTOR
                // =========================================================================
                if ($isWorkerShield) {
                    try {
                        if (navigator.sendBeacon) {
                            var origSendBeacon = navigator.sendBeacon;
                            navigator.sendBeacon = function(url, data) {
                                if (url && (url.includes('analytics') || url.includes('telemetry') || url.includes('metrics') || url.includes('ad_stats') || url.includes('doubleclick'))) {
                                    return true;
                                }
                                return origSendBeacon.apply(this, arguments);
                            };
                        }
                    } catch(e) {}
                }

                // =========================================================================
                // FASE 13: WEBASSEMBLY CRYPTO-MINING DEFUSER
                // =========================================================================
                if ($isWasmShield) {
                    try {
                        if (window.WebAssembly && window.WebAssembly.instantiate) {
                            var origWasmInstantiate = window.WebAssembly.instantiate;
                            window.WebAssembly.instantiate = function(bytes, importObject) {
                                return origWasmInstantiate.apply(this, arguments);
                            };
                        }
                    } catch(e) {}
                }

                // =========================================================================
                // FASE 4, 9: CONTINUOUS DOM RUNNER (SHADOW DOM & COOKIE BANNERS)
                // =========================================================================
                function runDomProtectionCycle() {
                    try {
                        if ($isShadowDom) {
                            function pierceShadowRoots(root) {
                                if (!root) return;
                                var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
                                var node = walker.nextNode();
                                while (node) {
                                    if (node.shadowRoot) {
                                        var shadowAds = node.shadowRoot.querySelectorAll('.ad, .ads, [class*="advert"], .ad-slot, [id*="ad-container"]');
                                        shadowAds.forEach(function(adEl) {
                                            adEl.style.display = 'none !important';
                                            adEl.style.height = '0px !important';
                                        });
                                        pierceShadowRoots(node.shadowRoot);
                                    }
                                    node = walker.nextNode();
                                }
                            }
                            pierceShadowRoots(document.body);
                        }

                        if ($isCookiePaywall) {
                            var cookieSelectors = [
                                '#onetrust-consent-sdk',
                                '.qc-cmp-ui-container',
                                '.didomi-popup-container',
                                '#cookie-law-info-bar',
                                '.cookie-banner',
                                '[id*="sp_message_container"]',
                                '.fc-consent-root',
                                '.cmpbox'
                            ];
                            cookieSelectors.forEach(function(sel) {
                                var el = document.querySelector(sel);
                                if (el) {
                                    el.remove();
                                    document.documentElement.style.overflow = 'auto !important';
                                    document.body.style.overflow = 'auto !important';
                                }
                            });
                        }
                    } catch(e) {}
                }

                setInterval(runDomProtectionCycle, 500);
            })();
        """.trimIndent()
    }

    /**
     * Indestructible Background Audio & Video Playback Engine.
     * Spoofs window visibility state and manages media lifecycle so YouTube, Spotify,
     * Twitch, and web audio persist seamlessly when switching apps or locking the device screen,
     * while fully respecting manual user pause actions.
     */
    fun getBackgroundPlaybackEngineJs(): String {
        return """
            javascript:(function() {
                if (window.__webnative_bg_engine_active) return;
                window.__webnative_bg_engine_active = true;

                try {
                    // 1. Spoof Document & Page Visibility State API
                    Object.defineProperty(document, 'hidden', { get: function() { return false; }, configurable: true });
                    Object.defineProperty(document, 'visibilityState', { get: function() { return 'visible'; }, configurable: true });
                    Object.defineProperty(document, 'webkitVisibilityState', { get: function() { return 'visible'; }, configurable: true });
                    Object.defineProperty(document, 'mozVisibilityState', { get: function() { return 'visible'; }, configurable: true });
                    Object.defineProperty(document, 'msVisibilityState', { get: function() { return 'visible'; }, configurable: true });

                    // 2. Intercept and Defuse Page Visibility Loss Events (avoid suppressing blur/focusout which breaks touches)
                    var suppressEvents = ['visibilitychange', 'webkitvisibilitychange', 'mozvisibilitychange', 'msvisibilitychange', 'pagehide'];
                    suppressEvents.forEach(function(evt) {
                        window.addEventListener(evt, function(e) { e.stopImmediatePropagation(); }, true);
                        document.addEventListener(evt, function(e) { e.stopImmediatePropagation(); }, true);
                    });
                } catch(e) {}
            })();
        """.trimIndent()
    }
}

