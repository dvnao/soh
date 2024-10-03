// ==UserScript==
// @name         soh
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  socket.io traffic viewer for BrawlHeroes (Anime Battle)
// @author       divine
// @grant        none
// @match        https://cdn-bs.brawlheroes.com/en/index-bsh5.html*
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

// either paste into console when the game loads or put this in tampermonkey

(function () {
	"use strict";

	class SocketUtils {
		constructor() {
			this.hookedSockets = {
				main: false,
				chat: false,
			};
			this.originalMethods = {};
			this.blockedEvents = new Set(["ping", "pong"]); // Exclude annoying events
			this.packetLog = new Map();
		}

		getSocket(type) {
			return window.ts?.[`${type}Client`]?.socket;
		}

		hookSocket(type) {
			const socket = this.getSocket(type);
			if (!socket || this.hookedSockets[type]) return;

			["emit", "on", "onevent"].forEach((method) =>
				this.overrideSocketMethod(socket, method, type)
			);

			this.hookedSockets[type] = true;
			console.log(`${type} socket hooked for monitoring.`);
		}

		overrideSocketMethod(socket, method, type) {
			const methodKey = `${type}_${method}`;
			this.originalMethods[methodKey] = socket[method];

			socket[method] = (...args) => {
				const event = args[0];
				const data = method === "onevent" ? args[1] : args.slice(1);
				const direction = method === "emit" ? "outgoing" : "incoming";

				if (this.blockedEvents.has(event)) {
					return; // Skip blocked events
				}

				this.logPacket(type, direction, event, data);
				this.originalMethods[methodKey].apply(socket, args);
			};
		}

		logPacket(socketType, direction, event, data) {
			const logEntry = {
				timestamp: Date.now(),
				socketType,
				direction,
				event,
				data,
			};

			if (!this.packetLog.has(event)) {
				this.packetLog.set(event, []);
			}
			this.packetLog.get(event).push(logEntry);
			console.log(`[${socketType}] ${direction}:`, event, data);
		}

		replayPacket(event, packetIndex) {
			if (!this.packetLog.has(event)) {
				console.error(`No packets logged for event: ${event}`);
				return;
			}

			const packets = this.packetLog.get(event);
			if (!packets || packetIndex < 0 || packetIndex >= packets.length) {
				console.error("Invalid packet index for replay.");
				return;
			}

			const packet = packets[packetIndex];
			const socket = this.getSocket(packet.socketType);

			if (!socket) {
				console.error(`Socket of type '${packet.socketType}' not found.`);
				return;
			}

			if (packet.direction === "incoming") {
				console.log(`Cannot replay incoming packets.`);
				return;
			}

			try {
				socket.emit(packet.event, ...packet.data);
				console.log(`Replayed packet:`, {
					event: packet.event,
					data: packet.data,
					timestamp: packet.timestamp,
					socketType: packet.socketType,
				});
			} catch (error) {
				console.error(`Failed to replay packet:`, error);
			}
		}

		blockEvent(event) {
			this.blockedEvents.add(event);
			console.log(`Blocked event added: ${event}`);
		}

		unblockEvent(event) {
			this.blockedEvents.delete(event);
			console.log(`Blocked event removed: ${event}`);
		}
	}

	class Monitor {
		constructor() {
			this.socketUtils = new SocketUtils();
			this.init();
		}

		async waitForGlobalVariable(key) {
			if (window[key] !== undefined) return;
			return new Promise((resolve, reject) => {
				const observer = new MutationObserver(() => {
					if (window[key] !== undefined) {
						observer.disconnect();
						resolve();
					}
				});
				observer.observe(document, { childList: true, subtree: true });
				setTimeout(() => {
					observer.disconnect();
					reject(new Error(`Failed to find global ${key} after timeout`));
				}, 5000);
			});
		}

		async init() {
			try {
				await this.waitForGlobalVariable("ts");
				console.log("Global 'ts' object found:", window.ts);
				window.spy = this.socketUtils;
				this.socketUtils.hookSocket("main");
				this.socketUtils.hookSocket("chat");
			} catch (error) {
				console.error("Initialization failed:", error);
			}
		}
	}

	new Monitor();
})();
