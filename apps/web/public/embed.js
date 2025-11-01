// Padyna Widget SDK
(function () {
  "use strict";

  class PadynaWidget {
    constructor(config) {
      this.config = {
        embedToken: config.embedToken,
        baseUrl: config.baseUrl || "https://padyna.com",
        containerId: config.containerId || "padyna-widget",
        mode: config.mode || "bubble",
        theme: config.theme || "light",
        position: config.position || "bottom-right",
        bubbleSize: config.bubbleSize || "medium",
        showBadge: config.showBadge !== false,
        autoOpen: config.autoOpen || false,
        openDelay: config.openDelay || 0,
        showWelcomePopup: config.showWelcomePopup || false,
        welcomeMessage:
          config.welcomeMessage || "Hi👋, I am Padyna AI, ask me anything!",
        welcomePopupDelay: config.welcomePopupDelay || 2000,
        welcomePopupDuration: config.welcomePopupDuration || 0,
        zIndex: config.zIndex || 9999,
        ...config,
      };

      this.isLoaded = false;
      this.isOpen = false;
      this.iframe = null;
      this.container = null;
      this.bubble = null;
      this.welcomePopup = null;
      this.unreadCount = 0;
      this.chatData = null;
      this.welcomePopupShown = false;
    }

    init() {
      if (this.isLoaded) {
        console.warn("Padyna Widget already initialized");
        return;
      }

      this.loadChatData()
        .then(() => {
          this.createContainer();
          if (this.config.mode === "bubble") {
            this.createBubble();
            if (this.config.showWelcomePopup) {
              this.createWelcomePopup();
            }
          } else {
            this.createIframe();
          }
          this.setupEventListeners();
          this.handleAutoOpen();
          this.isLoaded = true;
          this.dispatchEvent("padyna-widget-ready", { widget: this });
        })
        .catch((error) => {
          console.error("Failed to initialize Padyna Widget:", error);
          this.handleError({ message: error.message });
        });
    }

    async loadChatData() {
      try {
        const response = await fetch(
          `${this.config.baseUrl}/api/embed/chatbot/${this.config.embedToken}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to load chatbot: ${response.status}`);
        }

        this.chatData = await response.json();
      } catch (error) {
        throw new Error(`Failed to load chat configuration: ${error.message}`);
      }
    }

    createContainer() {
      this.container = document.getElementById(this.config.containerId);

      if (!this.container) {
        this.container = document.createElement("div");
        this.container.id = this.config.containerId;
        document.body.appendChild(this.container);
      }

      Object.assign(this.container.style, {
        position: "fixed",
        zIndex: this.config.zIndex.toString(),
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      });
    }

    createWelcomePopup() {
      const popupShownKey = `padyna-welcome-shown-${this.config.embedToken}`;
      if (sessionStorage.getItem(popupShownKey)) {
        return;
      }

      this.welcomePopup = document.createElement("div");
      this.welcomePopup.className = "padyna-welcome-popup";

      Object.assign(this.welcomePopup.style, {
        position: "absolute",
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "16px 20px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
        width: "300px",
        opacity: "0",
        transform: "translateY(10px) scale(0.95)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: "none",
        zIndex: (this.config.zIndex - 1).toString(),
      });

      this.positionWelcomePopup();

      const content = document.createElement("div");
      content.style.display = "flex";
      content.style.alignItems = "flex-start";
      content.style.gap = "8px";

      const message = document.createElement("div");
      message.textContent = this.config.welcomeMessage;
      Object.assign(message.style, {
        flex: "1",
        fontSize: "14px",
        lineHeight: "1.5",
        color: "#1f2937",
      });

      const closeButton = document.createElement("button");
      closeButton.innerHTML = "×";
      Object.assign(closeButton.style, {
        background: "none",
        border: "none",
        fontSize: "20px",
        lineHeight: "1",
        color: "#9ca3af",
        cursor: "pointer",
        padding: "0",
        width: "20px",
        height: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: "0",
        transition: "color 0.2s",
      });

      closeButton.addEventListener("mouseenter", () => {
        closeButton.style.color = "#6b7280";
      });

      closeButton.addEventListener("mouseleave", () => {
        closeButton.style.color = "#9ca3af";
      });

      closeButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.hideWelcomePopup();
      });

      content.appendChild(message);
      content.appendChild(closeButton);
      this.welcomePopup.appendChild(content);

      this.welcomePopup.addEventListener("click", () => {
        this.hideWelcomePopup();
        this.openChat();
      });

      this.container.appendChild(this.welcomePopup);

      setTimeout(() => {
        this.showWelcomePopup();
      }, this.config.welcomePopupDelay);
    }

    positionWelcomePopup() {
      if (!this.welcomePopup) return;

      const bubbleSize = this.getBubbleSize();
      const gap = 12;

      this.welcomePopup.style.top = "auto";
      this.welcomePopup.style.bottom = "auto";
      this.welcomePopup.style.left = "auto";
      this.welcomePopup.style.right = "auto";

      switch (this.config.position) {
        case "bottom-right":
          this.welcomePopup.style.bottom = `${bubbleSize + gap}px`;
          this.welcomePopup.style.right = "0";
          break;
        case "bottom-left":
          this.welcomePopup.style.bottom = `${bubbleSize + gap}px`;
          this.welcomePopup.style.left = "0";
          break;
        case "top-right":
          this.welcomePopup.style.top = `${bubbleSize + gap}px`;
          this.welcomePopup.style.right = "0";
          break;
        case "top-left":
          this.welcomePopup.style.top = `${bubbleSize + gap}px`;
          this.welcomePopup.style.left = "0";
          break;
        default:
          this.welcomePopup.style.bottom = `${bubbleSize + gap}px`;
          this.welcomePopup.style.right = "0";
      }
    }

    showWelcomePopup() {
      if (!this.welcomePopup || this.welcomePopupShown || this.isOpen) return;

      this.welcomePopup.style.opacity = "1";
      this.welcomePopup.style.transform = "translateY(0) scale(1)";
      this.welcomePopup.style.pointerEvents = "auto";
      this.welcomePopupShown = true;

      const popupShownKey = `padyna-welcome-shown-${this.config.embedToken}`;
      sessionStorage.setItem(popupShownKey, "true");

      this.dispatchEvent("padyna-welcome-popup-shown", {});

      if (this.config.welcomePopupDuration > 0) {
        setTimeout(() => {
          this.hideWelcomePopup();
        }, this.config.welcomePopupDuration);
      }
    }

    hideWelcomePopup() {
      if (!this.welcomePopup) return;

      this.welcomePopup.style.opacity = "0";
      this.welcomePopup.style.transform = "translateY(10px) scale(0.95)";
      this.welcomePopup.style.pointerEvents = "none";

      this.dispatchEvent("padyna-welcome-popup-hidden", {});

      setTimeout(() => {
        if (this.welcomePopup?.parentNode) {
          this.welcomePopup.parentNode.removeChild(this.welcomePopup);
          this.welcomePopup = null;
        }
      }, 300);
    }

    createBubble() {
      this.bubble = document.createElement("div");
      this.bubble.className = "padyna-bubble";
      this.setupBubbleStyles();
      this.setupBubbleContent();
      this.positionBubble();
      this.bubble.addEventListener("click", () => this.toggleChat());
      this.container.appendChild(this.bubble);
      this.createIframe();
      this.iframe.style.display = "none";
    }

    setupBubbleStyles() {
      const primaryColor = this.chatData?.primaryColor || "#2563eb";
      const size = this.getBubbleSize();

      Object.assign(this.bubble.style, {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: primaryColor,
        color: "white",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        userSelect: "none",
      });

      this.bubble.addEventListener("mouseenter", () => {
        this.bubble.style.transform = "scale(1.05)";
        this.bubble.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2)";
      });

      this.bubble.addEventListener("mouseleave", () => {
        this.bubble.style.transform = "scale(1)";
        this.bubble.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
      });
    }

    setupBubbleContent() {
      const content = document.createElement("div");
      content.style.position = "relative";
      content.style.display = "flex";
      content.style.alignItems = "center";
      content.style.justifyContent = "center";

      const chatIcon = document.createElement("div");
      chatIcon.className = "padyna-chat-icon";
      chatIcon.style.transition = "opacity 0.2s ease-in-out";
      chatIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#FFFFFF" fill-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10c-1.6 0-3.112-.376-4.452-1.044a1.63 1.63 0 0 0-1.149-.133l-2.226.596a1.3 1.3 0 0 1-1.591-1.592l.595-2.226a1.63 1.63 0 0 0-.134-1.148A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10M12 7.25a.75.75 0 0 1 .75.75v8a.75.75 0 0 1-1.5 0V8a.75.75 0 0 1 .75-.75M8.75 10a.75.75 0 0 0-1.5 0v4a.75.75 0 0 0 1.5 0zM16 9.25a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4a.75.75 0 0 1 .75-.75" clip-rule="evenodd"/></svg>
      `;

      const chevronIcon = document.createElement("div");
      chevronIcon.className = "padyna-chevron-icon";
      chevronIcon.style.display = "none";
      chevronIcon.style.transition = "opacity 0.2s ease-in-out";
      chevronIcon.innerHTML = `
       <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/></svg>
      `;

      content.appendChild(chatIcon);
      content.appendChild(chevronIcon);

      if (this.config.showBadge && this.unreadCount > 0) {
        this.createNotificationBadge(content);
      }

      this.bubble.appendChild(content);
    }

    updateBubbleIcon() {
      const chatIcon = this.bubble?.querySelector(".padyna-chat-icon");
      const chevronIcon = this.bubble?.querySelector(".padyna-chevron-icon");

      if (chatIcon && chevronIcon) {
        if (this.isOpen) {
          chatIcon.style.display = "none";
          chevronIcon.style.display = "block";
        } else {
          chatIcon.style.display = "block";
          chevronIcon.style.display = "none";
        }
      }
    }

    createNotificationBadge(parent) {
      const badge = document.createElement("div");
      badge.className = "padyna-notification-badge";
      badge.textContent =
        this.unreadCount > 99 ? "99+" : this.unreadCount.toString();

      Object.assign(badge.style, {
        position: "absolute",
        top: "-2px",
        right: "-2px",
        backgroundColor: "#ef4444",
        color: "white",
        borderRadius: "10px",
        padding: "2px 6px",
        fontSize: "11px",
        fontWeight: "600",
        minWidth: "18px",
        height: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid white",
      });

      parent.appendChild(badge);
    }

    createIframe() {
      this.iframe = document.createElement("iframe");
      const src =
        this.config.mode === "bubble"
          ? `${this.config.baseUrl}/bubble/${this.config.embedToken}`
          : `${this.config.baseUrl}/talk/${this.config.embedToken}`;

      this.iframe.src = src;
      this.iframe.title = this.chatData?.name || "Padyna Widget";
      this.iframe.allow = "clipboard-read; clipboard-write";

      if (this.config.mode === "bubble") {
        this.setupBubbleIframeStyles();
      } else {
        this.setupIframeStyles();
      }

      this.container.appendChild(this.iframe);
    }

    setupBubbleIframeStyles() {
      Object.assign(this.iframe.style, {
        width: "400px",
        height: "550px",
        maxHeight: "100vh",
        border: "none",
        borderRadius: "16px",
        boxShadow: "0 12px 28px rgba(0, 0, 0, 0.15)",
        background: "white",
        position: "absolute",
        overflow: "hidden",
        bottom: "75px",
        right: "0",
        transform: "scale(0.8) translateY(20px)",
        opacity: "0",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transformOrigin: "bottom right",
      });

      if (window.innerWidth <= 768) {
        Object.assign(this.iframe.style, {
          width: "100vw",
          height: "calc(100vh - 80px)",
          maxHeight: "calc(100vh - 80px)",
          borderRadius: "0",
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          bottom: "80px",
          transform: "translateY(100%)",
          transformOrigin: "bottom center",
          zIndex: this.config.zIndex + 1,
        });
      }
    }

    setupIframeStyles() {
      Object.assign(this.iframe.style, {
        width: "100%",
        height: "100%",
        border: "none",
        background: "transparent",
      });
    }

    positionBubble() {
      const margin = 15;

      switch (this.config.position) {
        case "bottom-right":
          this.container.style.bottom = `${margin}px`;
          this.container.style.right = `${margin}px`;
          break;
        case "bottom-left":
          this.container.style.bottom = `${margin}px`;
          this.container.style.left = `${margin}px`;
          break;
        case "top-right":
          this.container.style.top = `${margin}px`;
          this.container.style.right = `${margin}px`;
          break;
        case "top-left":
          this.container.style.top = `${margin}px`;
          this.container.style.left = `${margin}px`;
          break;
        default:
          this.container.style.bottom = `${margin}px`;
          this.container.style.right = `${margin}px`;
      }

      this.container.style.width = "auto";
      this.container.style.height = "auto";
    }

    getBubbleSize() {
      const sizes = {
        small: 50,
        medium: 60,
        large: 70,
      };
      return sizes[this.config.bubbleSize] || sizes.medium;
    }

    toggleChat() {
      if (this.isOpen) {
        this.closeChat();
      } else {
        this.openChat();
      }
    }

    openChat() {
      if (this.config.mode !== "bubble" || this.isOpen) return;

      if (this.welcomePopup) {
        this.hideWelcomePopup();
      }

      this.isOpen = true;
      this.iframe.style.display = "block";

      this.iframe.contentWindow?.postMessage(
        { type: "padyna-widget-user-opened" },
        this.config.baseUrl,
      );

      requestAnimationFrame(() => {
        this.iframe.style.opacity = "1";
        this.iframe.style.transform = "scale(1) translateY(0)";
      });

      this.updateBubbleIcon();
      this.clearUnreadCount();
      this.dispatchEvent("padyna-bubble-opened", { isOpen: true });
    }

    closeChat() {
      if (this.config.mode !== "bubble" || !this.isOpen) return;

      this.isOpen = false;

      this.iframe.style.opacity = "0";
      this.iframe.style.transform =
        window.innerWidth <= 768
          ? "translateY(100%)"
          : "scale(0.8) translateY(20px)";

      this.updateBubbleIcon();

      setTimeout(() => {
        this.iframe.style.display = "none";
      }, 300);

      this.dispatchEvent("padyna-bubble-closed", { isOpen: false });
    }

    handleAutoOpen() {
      if (this.config.autoOpen && this.config.openDelay > 0) {
        setTimeout(() => {
          this.openChat();
        }, this.config.openDelay);
      }
    }

    setupEventListeners() {
      window.addEventListener("message", (event) => {
        if (event.origin !== this.config.baseUrl) {
          return;
        }

        const { type, data } = event.data;

        switch (type) {
          case "padyna-widget-resize":
            this.handleResize(data);
            break;
          case "padyna-widget-toggle":
            this.handleToggle(data);
            break;
          case "padyna-widget-error":
            this.handleError(data);
            break;
          case "padyna-widget-close":
            this.closeChat();
            break;
          case "padyna-message-received":
            this.handleNewMessage(data);
            break;
        }
      });

      window.addEventListener("resize", () => {
        if (this.config.mode === "bubble") {
          this.handleWindowResize();
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && this.isOpen) {
          this.closeChat();
        }
      });

      window.addEventListener("beforeunload", () => {
        if (this.iframe && this.isOpen) {
          this.iframe.contentWindow.postMessage(
            { type: "parent-page-unload" },
            this.config.baseUrl,
          );
        }
      });
    }

    handleWindowResize() {
      if (!this.iframe) return;

      if (window.innerWidth <= 768) {
        Object.assign(this.iframe.style, {
          width: "100vw",
          height: "calc(100vh - 80px)",
          maxHeight: "calc(100vh - 80px)",
          borderRadius: "0",
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          bottom: "80px",
          zIndex: this.config.zIndex + 1,
        });
      } else {
        Object.assign(this.iframe.style, {
          width: "450px",
          height: "550px",
          maxHeight: "80vh",
          borderRadius: "16px",
          position: "absolute",
          bottom: "80px",
          right: "0",
          left: "auto",
          top: "auto",
          zIndex: this.config.zIndex,
        });
      }
    }

    handleResize(data) {
      if (this.iframe && this.config.mode !== "bubble") {
        this.iframe.style.width = `${data.width}px`;
        this.iframe.style.height = `${data.height}px`;
      }
    }

    handleToggle(data) {
      if (data.action === "close") {
        this.closeChat();
      } else if (data.action === "open") {
        this.openChat();
      }
    }

    handleNewMessage(data) {
      if (!this.isOpen && this.config.showBadge) {
        this.unreadCount++;
        this.updateNotificationBadge();
      }

      this.dispatchEvent("padyna-message-received", data);
    }

    updateNotificationBadge() {
      const badge = this.bubble?.querySelector(".padyna-notification-badge");
      if (badge) {
        badge.textContent =
          this.unreadCount > 99 ? "99+" : this.unreadCount.toString();
        badge.style.display = this.unreadCount > 0 ? "flex" : "none";
      } else if (this.unreadCount > 0 && this.bubble) {
        const content = this.bubble.querySelector("div");
        if (content) {
          this.createNotificationBadge(content);
        }
      }
    }

    handleError(data) {
      console.error("Padyna Widget Error:", data.message);
      this.dispatchEvent("padyna-widget-error", { error: data.message });
    }

    dispatchEvent(eventName, detail = {}) {
      const event = new CustomEvent(eventName, { detail });
      document.dispatchEvent(event);
    }

    destroy() {
      if (this.container?.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      this.isLoaded = false;
      this.isOpen = false;
    }

    show() {
      if (this.container) {
        this.container.style.display = "block";
      }
    }

    hide() {
      if (this.container) {
        this.container.style.display = "none";
      }
    }

    open() {
      this.openChat();
    }

    close() {
      this.closeChat();
    }

    setUnreadCount(count) {
      this.unreadCount = Math.max(0, count);
      this.updateNotificationBadge();
    }

    clearUnreadCount() {
      this.unreadCount = 0;
      this.updateNotificationBadge();
    }

    showWelcome() {
      if (this.welcomePopup && !this.isOpen) {
        this.showWelcomePopup();
      }
    }

    hideWelcome() {
      if (this.welcomePopup) {
        this.hideWelcomePopup();
      }
    }
  }

  // Global API
  const PadynaAPI = {
    instances: new Map(),

    init: function (config) {
      if (!config.embedToken) {
        throw new Error("embedToken is required");
      }

      const instanceId = config.containerId || "default";

      if (this.instances.has(instanceId)) {
        console.warn(`Padyna Widget instance '${instanceId}' already exists`);
        return this.instances.get(instanceId);
      }

      const widget = new PadynaWidget(config);
      widget.init();

      this.instances.set(instanceId, widget);
      return widget;
    },

    destroy: function (instanceId = "default") {
      const widget = this.instances.get(instanceId);
      if (widget) {
        widget.destroy();
        this.instances.delete(instanceId);
      }
    },

    getInstance: function (instanceId = "default") {
      return this.instances.get(instanceId);
    },

    destroyAll: function () {
      this.instances.forEach((widget) => widget.destroy());
      this.instances.clear();
    },
  };

  // Initialize from global config or data attributes
  function initializeWidget() {
    // Check if there's a global config set before the script loaded
    if (window.PadynaWidget?.config && !window.PadynaWidget._initialized) {
      console.log("Initializing Padyna Widget from global config");
      const config = window.PadynaWidget.config;
      const widget = new PadynaWidget(config);
      widget.init();

      // Replace with API and store the instance
      const tempConfig = window.PadynaWidget.config;
      window.PadynaWidget = PadynaAPI;
      window.PadynaWidget.instances.set(
        config.containerId || "default",
        widget,
      );
      window.PadynaWidget._initialized = true;
      return;
    }

    // Check for data attributes
    const autoInitElements = document.querySelectorAll(
      "[data-padyna-embed-token]",
    );

    if (autoInitElements.length > 0) {
      console.log("Initializing Padyna Widget from data attributes");
      // Set up the API if not already done
      if (!window.PadynaWidget || !window.PadynaWidget.init) {
        window.PadynaWidget = PadynaAPI;
      }

      autoInitElements.forEach(function (element) {
        const config = {
          embedToken: element.getAttribute("data-padyna-embed-token"),
          containerId: element.id || undefined,
          baseUrl: element.getAttribute("data-padyna-base-url") || undefined,
          position: element.getAttribute("data-padyna-position") || undefined,
          mode: element.getAttribute("data-padyna-mode") || "bubble",
          bubbleSize:
            element.getAttribute("data-padyna-bubble-size") || "medium",
          autoOpen: element.getAttribute("data-padyna-auto-open") === "true",
          openDelay:
            Number.parseInt(element.getAttribute("data-padyna-open-delay")) ||
            0,
          showWelcomePopup:
            element.getAttribute("data-padyna-show-welcome") === "true",
          welcomeMessage:
            element.getAttribute("data-padyna-welcome-message") || undefined,
          welcomePopupDelay:
            Number.parseInt(
              element.getAttribute("data-padyna-welcome-delay"),
            ) || 500,
          welcomePopupDuration:
            Number.parseInt(
              element.getAttribute("data-padyna-welcome-duration"),
            ) || 0,
        };

        window.PadynaWidget.init(config);
      });
    } else if (!window.PadynaWidget || !window.PadynaWidget._initialized) {
      // No config found, just set up the API
      window.PadynaWidget = PadynaAPI;
    }
  }

  // Run initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWidget);
  } else {
    // DOM is already loaded
    initializeWidget();
  }
})();
