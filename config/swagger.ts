import path from "node:path";
import url from "node:url";
import env from '#start/env'

export default {
  path: path.dirname(url.fileURLToPath(import.meta.url)) + "/../",
  tagIndex: 2,
  info: {
    title: "Node Base Project",
    version: "1.0.0",
    description: "This is a node base project",
  },
  components: {
    securitySchemas: {
      bearerAuth: {
        type: 'http',
        schema: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  snakeCase: true,
  debug: env.get('DEBUG'), // set to true, to get some useful debug output
  ignore: ["/swagger", "/docs", "/group/permissions", "/users/su"],
  preferredPutPatch: "PUT", // if PUT/PATCH are provided for the same route, prefer PUT
  common: {
    parameters: {}, // OpenAPI conform parameters that are commonly used
    headers: {}, // OpenAPI conform headers that are commonly used
  },
  securitySchemes: {
    ApiKeyAuth: {
      type: "apiKey",
      in: "header",
      name: "X-API-Key"
    }
  }, // optional
  // authMiddlewares: ["auth", "auth:api"], // optional
  // defaultSecurityScheme: "BearerAuth", // optional
  persistAuthorization: true, // persist authorization between reloads on the swagger page
  showFullPath: true, // the path displayed after endpoint summary
};
