import * as z from "./deps/zod_endpoints.ts";

const project = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

const error = z.object({
  code: z.number(),
  message: z.string(),
});

const errorResponse = z.response({
  status: 500,
  description: "Error occurred",
  body: z.body({
    type: "application/json",
    content: error,
  }),
});

export type Project = z.infer<typeof project>;
export type Error = z.infer<typeof error>;
export type Schema = z.output<typeof schema>;

export const schema = z.endpoints([
  z.endpoint({
    name: "GET_PROJECT",
    method: "GET",
    path: z.path("projects", z.string().uuid()),
    responses: [
      z.response({
        description: "Found project",
        status: 200,
        body: z.body({
          type: "application/json",
          content: project,
        }),
      }),
      z.response({
        description: "Not found",
        status: 404,
        body: z.body({
          type: "application/json",
          content: error,
        }),
      }),
      errorResponse,
    ],
  }),
  z.endpoint({
    name: "CREATE_PROJECT",
    method: "POST",
    path: z.path("projects"),
    body: z.body({
      type: "application/json",
      content: project,
    }),
    responses: [
      z.response({
        description: "Created project",
        status: 201,
      }),
      errorResponse,
    ],
  }),
  // z.endpoint({
  //   name: "LIST_PROJECT",
  //   method: "GET",
  //   path: z.path("projects"),
  //   headers: {},
  //   responses: [
  //     z.response({
  //       description: "Found project",
  //       status: 200,
  //       body: z.body({
  //         type: "application/json",
  //         content: z.array(project),
  //       }),
  //     }),
  //     errorResponse,
  //   ],
  // }),
]);

export const openApi = z.openApi(schema, {
  title: "Project API",
  version: "1.0.5",
});

export const docs = z.openApi(schema);

const service = {
  queryProject(id: string): Promise<Project> {
    console.log("query project:", id);
    return Promise.resolve({ id, name: "" });
  },

  mutateProject(project: Project): Promise<void> {
    console.log("mutate project", project);
    return Promise.resolve();
  },
};

export const server: z.Api<typeof schema> = {
  // @ts-ignore trust me
  async "GET_PROJECT"(request) {
    const project = await service.queryProject(request.path[1]);
    return {
      status: 200,
      body: {
        type: "application/json",
        content: project,
      },
    };
  },
  // @ts-ignore trust me
  async "CREATE_PROJECT"(request) {
    await service.mutateProject(request.body.content);
    return {
      status: 201,
    };
  },
};

export const client: z.Api<typeof schema> = {
  // @ts-ignore trust me
  "GET_PROJECT"(_request) {
    return Promise.resolve({
      description: "Found project",
      status: 200,
      body: {
        type: "application/json",
        content: { id: "", name: "" },
      },
    });
  },
};

if (import.meta.main) {
  console.log("api", JSON.stringify(docs));
  console.log("server", server);
  console.log("client", client);
}
