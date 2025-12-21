#!/usr/bin/env node

/**
 * Mock Server for Kratos and Hydra
 * Provides simple mock endpoints for local development without Docker
 */

const http = require("node:http");
const { URL } = require("node:url");

// In-memory storage
const storage = {
	identities: [
		{
			id: "550e8400-e29b-41d4-a716-446655440000",
			schema_id: "default",
			schema_url: "http://localhost:4433/schemas/default",
			state: "active",
			state_changed_at: "2025-01-15T10:00:00Z",
			traits: {
				email: "user@example.com",
				name: { first: "John", last: "Doe" },
			},
			verifiable_addresses: [
				{
					id: "1",
					value: "user@example.com",
					verified: true,
					via: "email",
					status: "completed",
				},
			],
			recovery_addresses: [
				{
					id: "1",
					value: "user@example.com",
					via: "email",
				},
			],
			metadata_public: null,
			created_at: "2025-01-15T10:00:00Z",
			updated_at: "2025-01-15T10:00:00Z",
		},
		{
			id: "660e8400-e29b-41d4-a716-446655440001",
			schema_id: "default",
			schema_url: "http://localhost:4433/schemas/default",
			state: "active",
			state_changed_at: "2025-01-14T15:30:00Z",
			traits: {
				email: "admin@example.com",
				name: { first: "Jane", last: "Admin" },
			},
			verifiable_addresses: [
				{
					id: "2",
					value: "admin@example.com",
					verified: true,
					via: "email",
					status: "completed",
				},
			],
			recovery_addresses: [
				{
					id: "2",
					value: "admin@example.com",
					via: "email",
				},
			],
			metadata_public: null,
			created_at: "2025-01-14T15:30:00Z",
			updated_at: "2025-01-14T15:30:00Z",
		},
	],
	sessions: [
		{
			id: "session-1",
			active: true,
			expires_at: "2025-12-31T23:59:59Z",
			authenticated_at: "2025-01-15T10:00:00Z",
			issued_at: "2025-01-15T10:00:00Z",
			identity: {
				id: "550e8400-e29b-41d4-a716-446655440000",
				schema_id: "default",
				schema_url: "http://localhost:4433/schemas/default",
				state: "active",
				traits: {
					email: "user@example.com",
					name: { first: "John", last: "Doe" },
				},
			},
		},
		{
			id: "session-2",
			active: true,
			expires_at: "2025-12-31T23:59:59Z",
			authenticated_at: "2025-01-14T15:30:00Z",
			issued_at: "2025-01-14T15:30:00Z",
			identity: {
				id: "660e8400-e29b-41d4-a716-446655440001",
				schema_id: "default",
				schema_url: "http://localhost:4433/schemas/default",
				state: "active",
				traits: {
					email: "admin@example.com",
					name: { first: "Jane", last: "Admin" },
				},
			},
		},
	],
	schemas: [
		{
			id: "default",
			$schema: "http://json-schema.org/draft-07/schema#",
			title: "Default Identity Schema",
			type: "object",
			properties: {
				traits: {
					type: "object",
					properties: {
						email: {
							type: "string",
							format: "email",
							title: "E-Mail",
							"ory.sh/kratos": {
								credentials: { password: { identifier: true } },
								recovery: { via: "email" },
								verification: { via: "email" },
							},
						},
						name: {
							type: "object",
							properties: {
								first: { type: "string", title: "First Name" },
								last: { type: "string", title: "Last Name" },
							},
						},
					},
					required: ["email"],
					additionalProperties: false,
				},
			},
		},
	],
	messages: [
		{
			id: "msg-1",
			type: "email",
			recipient: "user@example.com",
			body: "Welcome to our service!",
			subject: "Welcome",
			status: "sent",
			created_at: "2025-01-15T10:00:00Z",
			updated_at: "2025-01-15T10:00:00Z",
		},
	],
	oauth2Clients: [
		{
			client_id: "client-1",
			client_name: "Sample OAuth2 Client",
			client_secret: "secret",
			redirect_uris: ["http://localhost:3000/callback"],
			grant_types: ["authorization_code", "refresh_token"],
			response_types: ["code"],
			scope: "openid profile email",
			owner: "admin",
			created_at: "2025-01-15T10:00:00Z",
			updated_at: "2025-01-15T10:00:00Z",
		},
	],
};

// Helper functions
function sendJSON(res, statusCode, data) {
	res.writeHead(statusCode, {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
	});
	res.end(JSON.stringify(data));
}

function parseBody(req) {
	return new Promise((resolve, reject) => {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk.toString();
		});
		req.on("end", () => {
			try {
				resolve(body ? JSON.parse(body) : {});
			} catch (e) {
				reject(e);
			}
		});
	});
}

// Route handlers
const kratosAdminHandlers = {
	// Identities
	"GET /identities": (url) => {
		const pageSize = parseInt(url.searchParams.get("page_size") || "250", 10);
		const pageToken = url.searchParams.get("page_token");

		// Simple pagination simulation
		const start = pageToken ? parseInt(pageToken, 10) : 0;
		const end = Math.min(start + pageSize, storage.identities.length);
		const items = storage.identities.slice(start, end);

		return {
			status: 200,
			data: items,
			headers:
				end < storage.identities.length
					? {
							link: `<http://localhost:4434/identities?page_token=${end}&page_size=${pageSize}>; rel="next"`,
						}
					: {},
		};
	},

	"GET /identities/:id": (_url, params) => {
		const identity = storage.identities.find((i) => i.id === params.id);
		return identity ? { status: 200, data: identity } : { status: 404, data: { error: { message: "Identity not found" } } };
	},

	"POST /identities": async (_url, _params, req) => {
		const body = await parseBody(req);
		const newIdentity = {
			id: `id-${Date.now()}`,
			schema_id: body.schema_id || "default",
			schema_url: `http://localhost:4433/schemas/${body.schema_id || "default"}`,
			state: "active",
			state_changed_at: new Date().toISOString(),
			traits: body.traits || {},
			verifiable_addresses: [],
			recovery_addresses: [],
			metadata_public: body.metadata_public || null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
		storage.identities.push(newIdentity);
		return { status: 201, data: newIdentity };
	},

	"PATCH /identities/:id": async (_url, params, req) => {
		const body = await parseBody(req);
		const index = storage.identities.findIndex((i) => i.id === params.id);
		if (index === -1) {
			return {
				status: 404,
				data: { error: { message: "Identity not found" } },
			};
		}

		storage.identities[index] = {
			...storage.identities[index],
			...body,
			id: params.id,
			updated_at: new Date().toISOString(),
		};

		return { status: 200, data: storage.identities[index] };
	},

	"DELETE /identities/:id": (_url, params) => {
		const index = storage.identities.findIndex((i) => i.id === params.id);
		if (index === -1) {
			return {
				status: 404,
				data: { error: { message: "Identity not found" } },
			};
		}
		storage.identities.splice(index, 1);
		return { status: 204 };
	},

	"POST /identities/:id/recovery": (_url, params) => {
		const identity = storage.identities.find((i) => i.id === params.id);
		if (!identity) {
			return {
				status: 404,
				data: { error: { message: "Identity not found" } },
			};
		}
		return {
			status: 200,
			data: {
				recovery_link: `http://localhost:4433/self-service/recovery?token=mock-token-${params.id}`,
				expires_at: new Date(Date.now() + 3600000).toISOString(),
			},
		};
	},

	// Sessions
	"GET /sessions": (url) => {
		const pageSize = parseInt(url.searchParams.get("page_size") || "250", 10);
		const active = url.searchParams.get("active");
		const pageToken = url.searchParams.get("page_token");

		let sessions = storage.sessions;
		if (active !== null) {
			sessions = sessions.filter((s) => s.active === (active === "true"));
		}

		const start = pageToken ? parseInt(pageToken, 10) : 0;
		const end = Math.min(start + pageSize, sessions.length);
		const items = sessions.slice(start, end);

		return {
			status: 200,
			data: items,
			headers:
				end < sessions.length
					? {
							link: `<http://localhost:4434/sessions?page_token=${end}&page_size=${pageSize}>; rel="next"`,
						}
					: {},
		};
	},

	"GET /sessions/:id": (_url, params) => {
		const session = storage.sessions.find((s) => s.id === params.id);
		return session ? { status: 200, data: session } : { status: 404, data: { error: { message: "Session not found" } } };
	},

	"DELETE /sessions/:id": (_url, params) => {
		const index = storage.sessions.findIndex((s) => s.id === params.id);
		if (index === -1) {
			return { status: 404, data: { error: { message: "Session not found" } } };
		}
		storage.sessions.splice(index, 1);
		return { status: 204 };
	},

	"PATCH /sessions/:id/extend": (_url, params) => {
		const session = storage.sessions.find((s) => s.id === params.id);
		if (!session) {
			return { status: 404, data: { error: { message: "Session not found" } } };
		}
		session.expires_at = new Date(Date.now() + 86400000).toISOString();
		return { status: 200, data: session };
	},

	"DELETE /sessions/:id/disable": (_url, params) => {
		const session = storage.sessions.find((s) => s.id === params.id);
		if (!session) {
			return { status: 404, data: { error: { message: "Session not found" } } };
		}
		session.active = false;
		return { status: 200, data: session };
	},

	// Messages
	"GET /courier/messages": (url) => {
		const pageSize = parseInt(url.searchParams.get("page_size") || "250", 10);
		const pageToken = url.searchParams.get("page_token");

		const start = pageToken ? parseInt(pageToken, 10) : 0;
		const end = Math.min(start + pageSize, storage.messages.length);
		const items = storage.messages.slice(start, end);

		return {
			status: 200,
			data: items,
			headers:
				end < storage.messages.length
					? {
							link: `<http://localhost:4434/courier/messages?page_token=${end}&page_size=${pageSize}>; rel="next"`,
						}
					: {},
		};
	},

	"GET /courier/messages/:id": (_url, params) => {
		const message = storage.messages.find((m) => m.id === params.id);
		return message ? { status: 200, data: message } : { status: 404, data: { error: { message: "Message not found" } } };
	},

	// Health
	"GET /health/alive": () => ({ status: 200, data: { status: "ok" } }),
	"GET /health/ready": () => ({ status: 200, data: { status: "ok" } }),
};

const kratosPublicHandlers = {
	// Schemas
	"GET /schemas": () => {
		return {
			status: 200,
			data: storage.schemas.map((s) => ({
				id: s.id,
				url: `http://localhost:4433/schemas/${s.id}`,
			})),
		};
	},

	"GET /schemas/:id": (_url, params) => {
		const schema = storage.schemas.find((s) => s.id === params.id);
		return schema ? { status: 200, data: schema } : { status: 404, data: { error: { message: "Schema not found" } } };
	},

	// Health
	"GET /health/alive": () => ({ status: 200, data: { status: "ok" } }),
	"GET /health/ready": () => ({ status: 200, data: { status: "ok" } }),
};

const hydraAdminHandlers = {
	// OAuth2 Clients
	"GET /clients": (url) => {
		const pageSize = parseInt(url.searchParams.get("page_size") || "250", 10);
		const pageToken = url.searchParams.get("page_token");

		const start = pageToken ? parseInt(pageToken, 10) : 0;
		const end = Math.min(start + pageSize, storage.oauth2Clients.length);
		const items = storage.oauth2Clients.slice(start, end);

		return { status: 200, data: items };
	},

	"GET /clients/:id": (_url, params) => {
		const client = storage.oauth2Clients.find((c) => c.client_id === params.id);
		return client ? { status: 200, data: client } : { status: 404, data: { error: { message: "Client not found" } } };
	},

	"POST /clients": async (_url, _params, req) => {
		const body = await parseBody(req);
		const newClient = {
			client_id: body.client_id || `client-${Date.now()}`,
			client_name: body.client_name || "New Client",
			client_secret: body.client_secret || "secret",
			redirect_uris: body.redirect_uris || [],
			grant_types: body.grant_types || ["authorization_code"],
			response_types: body.response_types || ["code"],
			scope: body.scope || "openid",
			owner: body.owner || "",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			...body,
		};
		storage.oauth2Clients.push(newClient);
		return { status: 201, data: newClient };
	},

	"PUT /clients/:id": async (_url, params, req) => {
		const body = await parseBody(req);
		const index = storage.oauth2Clients.findIndex((c) => c.client_id === params.id);
		if (index === -1) {
			return { status: 404, data: { error: { message: "Client not found" } } };
		}

		storage.oauth2Clients[index] = {
			...body,
			client_id: params.id,
			updated_at: new Date().toISOString(),
		};

		return { status: 200, data: storage.oauth2Clients[index] };
	},

	"PATCH /clients/:id": async (_url, params, req) => {
		const body = await parseBody(req);
		const index = storage.oauth2Clients.findIndex((c) => c.client_id === params.id);
		if (index === -1) {
			return { status: 404, data: { error: { message: "Client not found" } } };
		}

		// Handle JSON Patch operations
		if (Array.isArray(body)) {
			body.forEach((operation) => {
				if (operation.op === "replace" && operation.path && operation.value !== undefined) {
					const key = operation.path.replace(/^\//, "");
					storage.oauth2Clients[index][key] = operation.value;
				}
			});
		} else {
			storage.oauth2Clients[index] = {
				...storage.oauth2Clients[index],
				...body,
			};
		}

		storage.oauth2Clients[index].updated_at = new Date().toISOString();
		return { status: 200, data: storage.oauth2Clients[index] };
	},

	"DELETE /clients/:id": (_url, params) => {
		const index = storage.oauth2Clients.findIndex((c) => c.client_id === params.id);
		if (index === -1) {
			return { status: 404, data: { error: { message: "Client not found" } } };
		}
		storage.oauth2Clients.splice(index, 1);
		return { status: 204 };
	},

	// Health
	"GET /health/alive": () => ({ status: 200, data: { status: "ok" } }),
	"GET /health/ready": () => ({ status: 200, data: { status: "ok" } }),
};

const hydraPublicHandlers = {
	// Health
	"GET /health/alive": () => ({ status: 200, data: { status: "ok" } }),
	"GET /health/ready": () => ({ status: 200, data: { status: "ok" } }),

	// Well-known endpoints
	"GET /.well-known/openid-configuration": () => ({
		status: 200,
		data: {
			issuer: "http://localhost:4444",
			authorization_endpoint: "http://localhost:4444/oauth2/auth",
			token_endpoint: "http://localhost:4444/oauth2/token",
			jwks_uri: "http://localhost:4444/.well-known/jwks.json",
			subject_types_supported: ["public", "pairwise"],
			response_types_supported: ["code", "id_token", "token id_token"],
			grant_types_supported: ["authorization_code", "refresh_token", "client_credentials"],
		},
	}),
};

// Request handler
async function handleRequest(req, res, handlers) {
	// Handle CORS preflight
	if (req.method === "OPTIONS") {
		sendJSON(res, 204, {});
		return;
	}

	try {
		const url = new URL(req.url, `http://${req.headers.host}`);
		const path = url.pathname;
		const method = req.method;

		// Find matching handler
		for (const [route, handler] of Object.entries(handlers)) {
			const [routeMethod, routePath] = route.split(" ");
			if (routeMethod !== method) continue;

			// Check for exact match
			if (routePath === path) {
				const result = await handler(url, {}, req);
				if (result.status === 204) {
					res.writeHead(204, {
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
						"Access-Control-Allow-Headers": "Content-Type, Authorization",
					});
					res.end();
				} else {
					const _headers = { ...result.headers };
					sendJSON(res, result.status, result.data);
				}
				return;
			}

			// Check for parameterized match
			const routeParts = routePath.split("/");
			const pathParts = path.split("/");

			if (routeParts.length === pathParts.length) {
				const params = {};
				let matches = true;

				for (let i = 0; i < routeParts.length; i++) {
					if (routeParts[i].startsWith(":")) {
						params[routeParts[i].slice(1)] = pathParts[i];
					} else if (routeParts[i] !== pathParts[i]) {
						matches = false;
						break;
					}
				}

				if (matches) {
					const result = await handler(url, params, req);
					if (result.status === 204) {
						res.writeHead(204, {
							"Access-Control-Allow-Origin": "*",
							"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
							"Access-Control-Allow-Headers": "Content-Type, Authorization",
						});
						res.end();
					} else {
						sendJSON(res, result.status, result.data);
					}
					return;
				}
			}
		}

		// No handler found
		sendJSON(res, 404, {
			error: { message: `Route not found: ${method} ${path}` },
		});
	} catch (error) {
		console.error("Error handling request:", error);
		sendJSON(res, 500, { error: { message: error.message } });
	}
}

// Create servers
const kratosAdminServer = http.createServer((req, res) => handleRequest(req, res, kratosAdminHandlers));
const kratosPublicServer = http.createServer((req, res) => handleRequest(req, res, kratosPublicHandlers));
const hydraAdminServer = http.createServer((req, res) => handleRequest(req, res, hydraAdminHandlers));
const hydraPublicServer = http.createServer((req, res) => handleRequest(req, res, hydraPublicHandlers));

// Start servers
const KRATOS_ADMIN_PORT = process.env.KRATOS_ADMIN_PORT || 4434;
const KRATOS_PUBLIC_PORT = process.env.KRATOS_PUBLIC_PORT || 4433;
const HYDRA_ADMIN_PORT = process.env.HYDRA_ADMIN_PORT || 4445;
const HYDRA_PUBLIC_PORT = process.env.HYDRA_PUBLIC_PORT || 4444;

kratosAdminServer.listen(KRATOS_ADMIN_PORT, () => {
	console.log(`🚀 Mock Kratos Admin API running on http://localhost:${KRATOS_ADMIN_PORT}`);
});

kratosPublicServer.listen(KRATOS_PUBLIC_PORT, () => {
	console.log(`🚀 Mock Kratos Public API running on http://localhost:${KRATOS_PUBLIC_PORT}`);
});

hydraAdminServer.listen(HYDRA_ADMIN_PORT, () => {
	console.log(`🚀 Mock Hydra Admin API running on http://localhost:${HYDRA_ADMIN_PORT}`);
});

hydraPublicServer.listen(HYDRA_PUBLIC_PORT, () => {
	console.log(`🚀 Mock Hydra Public API running on http://localhost:${HYDRA_PUBLIC_PORT}`);
});

console.log("\n✅ Mock server ready for local development!");
console.log("📝 All endpoints return simple mock data");
console.log("💾 In-memory storage - data resets on restart\n");

// Graceful shutdown
process.on("SIGTERM", () => {
	kratosAdminServer.close();
	kratosPublicServer.close();
	hydraAdminServer.close();
	hydraPublicServer.close();
	process.exit(0);
});
