// Padyna Widget SDK
(function () {
  "use strict";

  class PadynaWidget {
    constructor(config) {
      this.config = {
        embedToken: config.embedToken,
        baseUrl: config.baseUrl || "https://padyna.com",
        containerId: config.containerId || "padyna-widget",
        mode: config.mode || "bubble", // 'bubble' or 'iframe'
        theme: config.theme || "light",
        position: config.position || "bottom-right",
        bubbleSize: config.bubbleSize || "medium", // 'small', 'medium', 'large'
        showBadge: config.showBadge !== false, // Default true
        autoOpen: config.autoOpen || false,
        openDelay: config.openDelay || 0,
        zIndex: config.zIndex || 9999,
        ...config,
      };

      this.isLoaded = false;
      this.isOpen = false;
      this.iframe = null;
      this.container = null;
      this.bubble = null;
      this.unreadCount = 0;
      this.chatData = null;
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

      // Apply base container styles
      this.container.style.position = "fixed";
      this.container.style.zIndex = this.config.zIndex.toString();
      this.container.style.fontFamily =
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      // Remove the problematic mobile container styles
      // The container should maintain its position for the bubble
      // Only the iframe needs mobile-specific positioning
    }
    createBubble() {
      // Create bubble trigger
      this.bubble = document.createElement("div");
      this.bubble.className = "padyna-bubble";
      this.setupBubbleStyles();
      this.setupBubbleContent();

      // Position the bubble
      this.positionBubble();

      // Add click handler
      this.bubble.addEventListener("click", () => this.toggleChat());

      this.container.appendChild(this.bubble);

      // Initially hidden iframe for chat
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

      // Hover effects
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
      // Create bubble content wrapper
      const content = document.createElement("div");
      content.style.position = "relative";
      content.style.display = "flex";
      content.style.alignItems = "center";
      content.style.justifyContent = "center";

      // Chat icon (default state)
      const chatIcon = document.createElement("div");
      chatIcon.className = "padyna-chat-icon";
      chatIcon.style.transition = "opacity 0.2s ease-in-out";
      chatIcon.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;

      // Chevron down icon (opened state)
      const chevronIcon = document.createElement("div");
      chevronIcon.className = "padyna-chevron-icon";
      chevronIcon.style.display = "none";
      chevronIcon.style.transition = "opacity 0.2s ease-in-out";
      chevronIcon.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;

      content.appendChild(chatIcon);
      content.appendChild(chevronIcon);

      // Add notification badge if needed
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
        width: "450px",
        height: "550px",
        maxHeight: "90vh",
        border: "none",
        borderRadius: "16px",
        boxShadow: "0 12px 28px rgba(0, 0, 0, 0.15)",
        background: "white",
        position: "absolute",
        overflow: "hidden",
        bottom: "80px",
        right: "0",
        transform: "scale(0.8) translateY(20px)",
        opacity: "0",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transformOrigin: "bottom right",
      });

      if (window.innerWidth <= 768) {
        // Mobile responsive
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
      const margin = 15; // Increased margin for better mobile spacing

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

      // Ensure container dimensions don't interfere with positioning
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

      this.isOpen = true;
      this.iframe.style.display = "block";

      // Notify the iframe that user actually opened the widget
      this.iframe.contentWindow?.postMessage(
        { type: "padyna-widget-user-opened" },
        this.config.baseUrl,
      );

      // Animate iframe in
      requestAnimationFrame(() => {
        this.iframe.style.opacity = "1";
        this.iframe.style.transform = "scale(1) translateY(0)";
      });

      // Update bubble icon to chevron
      this.updateBubbleIcon();

      // Clear unread count when opened
      this.clearUnreadCount();

      this.dispatchEvent("padyna-bubble-opened", { isOpen: true });
    }

    closeChat() {
      if (this.config.mode !== "bubble" || !this.isOpen) return;

      this.isOpen = false;

      // Animate iframe out
      this.iframe.style.opacity = "0";
      this.iframe.style.transform =
        window.innerWidth <= 768
          ? "translateY(100%)"
          : "scale(0.8) translateY(20px)";

      // Update bubble icon back to chat
      this.updateBubbleIcon();

      // Hide iframe after animation
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
      // Listen for messages from the iframe
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

      // Handle window resize for responsive behavior
      window.addEventListener("resize", () => {
        if (this.config.mode === "bubble") {
          this.handleWindowResize();
        }
      });

      // Handle escape key to close chat
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && this.isOpen) {
          this.closeChat();
        }
      });

      // Handle page unload to notify widget for analytics
      window.addEventListener("beforeunload", () => {
        if (this.iframe && this.isOpen) {
          // Notify the widget that the parent page is being unloaded
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
        // Mobile styles
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
        // Desktop styles
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
        // Create badge if it doesn't exist
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

    // Public API methods
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
  }

  // Global API
  window.PadynaWidget = {
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

  // Auto-initialize if config is provided via data attributes
  document.addEventListener("DOMContentLoaded", function () {
    const autoInitElements = document.querySelectorAll(
      "[data-padyna-embed-token]",
    );

    autoInitElements.forEach(function (element) {
      const config = {
        embedToken: element.getAttribute("data-padyna-embed-token"),
        containerId: element.id || undefined,
        baseUrl: element.getAttribute("data-padyna-base-url") || undefined,
        position: element.getAttribute("data-padyna-position") || undefined,
        mode: element.getAttribute("data-padyna-mode") || "bubble",
        bubbleSize: element.getAttribute("data-padyna-bubble-size") || "medium",
        autoOpen: element.getAttribute("data-padyna-auto-open") === "true",
        openDelay:
          Number.parseInt(element.getAttribute("data-padyna-open-delay")) || 0,
      };

      window.PadynaWidget.init(config);
    });
  });
})();
