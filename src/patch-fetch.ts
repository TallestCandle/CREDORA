// Patch window.fetch to provide a setter, preventing "Cannot set property fetch of #<Window> which has only a getter" errors
// This occurs in some sandboxed preview iframe environments when external SDKs attempt to hook or polyfill fetch.
try {
  const originalFetch = window.fetch;
  let currentFetch: any = originalFetch;

  // Stable wrapper function so window.fetch === window.fetch is always true
  const stableFetch = function (this: any, ...args: any[]) {
    const context = (this === window || !this) ? window : this;
    if (currentFetch && typeof currentFetch === 'function') {
      return currentFetch.apply(context, args as any);
    } else if (originalFetch && typeof originalFetch === 'function') {
      return originalFetch.apply(context, args as any);
    } else {
      return Promise.reject(new TypeError("fetch is not a function"));
    }
  };

  // Copy properties from originalFetch if they exist
  if (originalFetch) {
    try {
      Object.setPrototypeOf(stableFetch, originalFetch);
    } catch (e) {}
  }

  const fetchDesc = Object.getOwnPropertyDescriptor(window, 'fetch');
  if (!fetchDesc || fetchDesc.configurable) {
    Object.defineProperty(window, 'fetch', {
      get() {
        return stableFetch;
      },
      set(val) {
        if (typeof val === 'function') {
          currentFetch = val;
        } else {
          console.warn("[Credora Patch] Attempted to set window.fetch to a non-function value:", val);
        }
      },
      configurable: true,
      enumerable: true
    });
  } else {
    console.warn("[Credora Patch] window.fetch is not configurable, skipping override");
  }
} catch (e) {
  console.warn("[Credora Patch] Failed to define custom fetch getter/setter:", e);
}

// Intercept accesses to cross-origin parent/top/opener windows and wrap them in a protective Proxy.
// This prevents SecurityError/Blocked frame errors when external libraries (like Privy or wallet connectors)
// try to read properties (e.g., 'ethereum') from cross-origin window objects.
try {
  const windowProxyCache = new WeakMap<any, any>();

  const createSafeWindowProxy = (originalWindow: any) => {
    if (!originalWindow || originalWindow === window) return originalWindow;

    if (windowProxyCache.has(originalWindow)) {
      return windowProxyCache.get(originalWindow);
    }

    const proxy = new Proxy(originalWindow, {
      get(target, prop) {
        if (prop === 'then') {
          return undefined; // Prevent promise-like behavior
        }
        try {
          const value = target[prop];
          if (typeof value === 'function') {
            return value.bind(target);
          }
          return value;
        } catch (e) {
          // Gracefully suppress security/cross-origin errors and return undefined
          if (prop === 'postMessage') {
            return (...args: any[]) => {
              try {
                return target.postMessage(...args);
              } catch (err) {
                console.warn("[Credora Patch] failed to postMessage:", err);
              }
            };
          }
          return undefined;
        }
      },
      set(target, prop, value) {
        try {
          target[prop] = value;
          return true;
        } catch (e) {
          return false;
        }
      },
      has(target, prop) {
        try {
          return prop in target;
        } catch (e) {
          return false;
        }
      },
      ownKeys(target) {
        try {
          return Reflect.ownKeys(target);
        } catch (e) {
          return [];
        }
      },
      getOwnPropertyDescriptor(target, prop) {
        try {
          return Reflect.getOwnPropertyDescriptor(target, prop);
        } catch (e) {
          return undefined;
        }
      }
    });

    windowProxyCache.set(originalWindow, proxy);
    return proxy;
  };

  // Define safe getter for window.parent
  try {
    const originalParent = window.parent;
    const safeParent = createSafeWindowProxy(originalParent);
    const desc = Object.getOwnPropertyDescriptor(window, 'parent');
    if (!desc || desc.configurable) {
      Object.defineProperty(window, 'parent', {
        get() {
          return safeParent;
        },
        configurable: true,
        enumerable: true
      });
    } else {
      console.warn("[Credora Patch] window.parent is not configurable, skipping override");
    }
  } catch (err) {
    console.warn("[Credora Patch] Failed to override window.parent:", err);
  }

  // Define safe getter for window.top
  try {
    const originalTop = window.top;
    const safeTop = createSafeWindowProxy(originalTop);
    const desc = Object.getOwnPropertyDescriptor(window, 'top');
    if (!desc || desc.configurable) {
      Object.defineProperty(window, 'top', {
        get() {
          return safeTop;
        },
        configurable: true,
        enumerable: true
      });
    } else {
      console.warn("[Credora Patch] window.top is not configurable, skipping override");
    }
  } catch (err) {
    console.warn("[Credora Patch] Failed to override window.top:", err);
  }

  // Define safe getter for window.opener
  try {
    const originalOpener = window.opener;
    if (originalOpener) {
      const safeOpener = createSafeWindowProxy(originalOpener);
      const desc = Object.getOwnPropertyDescriptor(window, 'opener');
      if (!desc || desc.configurable) {
        Object.defineProperty(window, 'opener', {
          get() {
            return safeOpener;
          },
          configurable: true,
          enumerable: true
        });
      } else {
        console.warn("[Credora Patch] window.opener is not configurable, skipping override");
      }
    }
  } catch (err) {
    console.warn("[Credora Patch] Failed to override window.opener:", err);
  }
} catch (e) {
  console.warn("[Credora Patch] Failed to initialize cross-origin window proxy protection:", e);
}

export {};
