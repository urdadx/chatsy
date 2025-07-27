// Chatsy Widget SDK
(function () {
  "use strict";

  class ChatsyWidget {
    constructor(config) {
      this.config = {
        embedToken: config.embedToken,
        baseUrl: "http://localhost:3001", // Default base URL, can be overridden
        containerId: config.containerId || "chatsy-widget",
        theme: config.theme || "light",
        position: config.position || "bottom-right",
        ...config,
      };

      this.isLoaded = false;
      this.iframe = null;
      this.container = null;
    }

    init() {
      if (this.isLoaded) {
        console.warn("Chatsy Widget already initialized");
        return;
      }

      this.createContainer();
      this.createIframe();
      this.setupEventListeners();
      this.isLoaded = true;
    }

    createContainer() {
      this.container = document.getElementById(this.config.containerId);

      if (!this.container) {
        this.container = document.createElement("div");
        this.container.id = this.config.containerId;
        document.body.appendChild(this.container);
      }

      // Apply positioning styles
      this.container.style.position = "fixed";
      this.container.style.zIndex = "9999";

      switch (this.config.position) {
        case "bottom-right":
          this.container.style.bottom = "20px";
          this.container.style.right = "20px";
          break;
        case "bottom-left":
          this.container.style.bottom = "20px";
          this.container.style.left = "20px";
          break;
        case "top-right":
          this.container.style.top = "20px";
          this.container.style.right = "20px";
          break;
        case "top-left":
          this.container.style.top = "20px";
          this.container.style.left = "20px";
          break;
        default:
          this.container.style.bottom = "20px";
          this.container.style.right = "20px";
      }
    }

    createIframe() {
      this.iframe = document.createElement("iframe");
      this.iframe.src = `${this.config.baseUrl}/embed/${this.config.embedToken}`;
      this.iframe.style.width = "100%";
      this.iframe.style.height = "100%";
      this.iframe.style.border = "none";
      this.iframe.style.background = "transparent";
      this.iframe.title = "Chatsy Widget";
      this.iframe.allow = "clipboard-read; clipboard-write";

      this.container.appendChild(this.iframe);
    }

    setupEventListeners() {
      // Listen for messages from the iframe
      window.addEventListener("message", (event) => {
        if (event.origin !== this.config.baseUrl) {
          return;
        }

        const { type, data } = event.data;

        switch (type) {
          case "chatsy-widget-resize":
            this.handleResize(data);
            break;
          case "chatsy-widget-toggle":
            this.handleToggle(data);
            break;
          case "chatsy-widget-error":
            this.handleError(data);
            break;
        }
      });
    }

    handleResize(data) {
      if (this.container) {
        this.container.style.width = `${data.width}px`;
        this.container.style.height = `${data.height}px`;
      }
    }

    handleToggle(data) {
      // Handle widget open/close events
      const event = new CustomEvent("chatsy-widget-toggle", {
        detail: { isOpen: data.isOpen },
      });
      document.dispatchEvent(event);
    }

    handleError(data) {
      console.error("Chatsy Widget Error:", data.message);

      const event = new CustomEvent("chatsy-widget-error", {
        detail: { error: data.message },
      });
      document.dispatchEvent(event);
    }

    destroy() {
      if (this.container?.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      this.isLoaded = false;
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
  }

  // Global API
  window.ChatsyWidget = {
    instances: new Map(),

    init: function (config) {
      if (!config.embedToken) {
        throw new Error("embedToken is required");
      }

      const instanceId = config.containerId || "default";

      if (this.instances.has(instanceId)) {
        console.warn(`Chatsy Widget instance '${instanceId}' already exists`);
        return this.instances.get(instanceId);
      }

      const widget = new ChatsyWidget(config);
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
  };

  // Auto-initialize if config is provided via data attributes
  document.addEventListener("DOMContentLoaded", function () {
    const autoInitElements = document.querySelectorAll(
      "[data-chatsy-embed-token]",
    );

    autoInitElements.forEach(function (element) {
      const config = {
        embedToken: element.getAttribute("data-chatsy-embed-token"),
        containerId: element.id || undefined,
        baseUrl: element.getAttribute("data-chatsy-base-url") || undefined,
        position: element.getAttribute("data-chatsy-position") || undefined,
      };

      window.ChatsyWidget.init(config);
    });
  });
})();
