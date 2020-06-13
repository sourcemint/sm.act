
exports['gi0.PINF.it/build/v0'] = async function (LIB, CLASSES) {

    const ACT = require("./act").forLIB(LIB);

    class BuildStep extends CLASSES.BuildStep {

        async onWorkspace (result, workspace) {

            this.branchPath = await ACT.ensureBranch(workspace);

            await ACT.prepareBranch(workspace, this.branchPath);

            this.controlConfigPath = LIB.PATH.join(
                this.branchPath,
                '.circleci', 'config.yml'
            );

            this.controlConfig = {
                "version": 2.1,
                "jobs": {},
                "workflows": {}
            };
        }

        async onEveryBuild (result, build, target, instance, home, workspace) {
            const self = this;

            // TODO: Need 'build.file' and 'build.line' to uniquely identify build source instance.

            if (build.method === 'workflow') {

                const config = ACT.yamlToJSON(ACT.codeblockToYAML(build.config));
                // config ~ {
                //     "name": "02-CircleCI-Pipelines_02",
                //     "jobs": {
                //         "Run": {
                //             "machine": {
                //                 "image": "ubuntu-1604:201903-01"
                //             },
                //             "steps": [
                //                 "checkout",
                //                 {
                //                     "run": {
                //                         "name": "Act",
                //                         "command": "ls -a"
                //                     }
                //                 }
                //             ]
                //         }
                //     }
                // }

                await ACT.writeFile(result, LIB.PATH.join(target.path, 'workflow.yml'), ACT.jsonToYAML(config));

                const workflowTag = ACT.hash(LIB.PATH.relative(workspace.path, target.path)).replace(/\d/g, '').substring(0, 7);

                self.controlConfig.workflows[config.name] = {
                    jobs: []
                };

                Object.keys(config.jobs).forEach(function (jobName) {

                    const uniqueJobName = `${workflowTag}-${jobName}`;

                    // TODO: Also include some of the workflow name up to the max size of the workflow name on circleci
                    self.controlConfig.jobs[uniqueJobName] = config.jobs[jobName];

                    self.controlConfig.workflows[config.name].jobs.push(uniqueJobName);
                });

                // self.controlConfig ~ {
                //     "version": 2.1,
                //     "jobs": {
                //         "Run": {
                //             "machine": {
                //                 "image": "ubuntu-1604:201903-01"
                //             },
                //             "steps": [
                //                 "checkout",
                //                 {
                //                     "run": {
                //                         "name": "Act",
                //                         "command": "ls -a"
                //                     }
                //                 }
                //             ]
                //         }
                //     },
                //     "workflows": {
                //         "02-CircleCI-Pipelines_02": {
                //             "jobs": [
                //                 "Run"
                //             ]
                //         }
                //     }
                // }
            } else {
                throw new Error(`Unknown method '${build.method}'!`);
            }
        }

        async onDone (result, instance, home, workspace) {

            await ACT.writeFile(result, this.controlConfigPath, ACT.jsonToYAML(this.controlConfig));

            await ACT.persistBranch(this.branchPath);
        }

    }

    return BuildStep;
}
