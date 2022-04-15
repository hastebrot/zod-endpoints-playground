description:

- example of strictly typed endpoints using [zod-endpoints](https://github.com/flock-community/zod-endpoints) and [zod](https://github.com/colinhacks/zod).
- works with deno 1.20.6 (released in Apr 2022) and `--no-check=remote`.
- works with zod 3.8.0 (released in Aug 2021).
- works with vscode 1.66.2 and [deno vscode extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno) 3.12.0.

usage:

~~~
❯ deno --version
deno 1.20.6 (release, x86_64-apple-darwin)
v8 10.0.139.6
typescript 4.6.2

❯ deno task example:run
~~~

example:

~~~ts
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
  async "CREATE_PROJECT"(request) {
    await service.mutateProject(request.body.content);
    return {
      status: 201,
    };
  },
};

export const client: z.Api<typeof schema> = {
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
~~~
