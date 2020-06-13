
exports['gi0.PINF.it/build/v0'] = async function (LIB, CLASSES) {

    const ACT = require("./act").forLIB(LIB);

    class BuildStep extends CLASSES.BuildStep {

        async onWorkspace (result, workspace) {

            const branchPath = await ACT.ensureBranch(workspace);

            await ACT.prepareBranch(workspace, branchPath);
        }

        async onEveryBuild (result, build, target, instance, home, workspace) {

            // TODO: Need 'build.file' and 'build.line' to uniquely identify build source instance.

            if (build.method === 'workflow') {

                const config = ACT.codeblockToYAML(build.config);

                await ACT.writeFile(result, LIB.PATH.join(target.path, 'workflow.yml'), config);
                
                const branchPath = await ACT.ensureBranch(workspace);

                await ACT.writeFile(result, LIB.PATH.join(
                    branchPath,
                    '.github', 'workflows',
                    `${ACT.hash7(LIB.PATH.relative(workspace.path, target.path))}.yml`
                ), config);

            } else {
                throw new Error(`Unknown method '${build.method}'!`);
            }
        }

        async onDone (result, instance, home, workspace) {

            const branchPath = await ACT.ensureBranch(workspace);

            await ACT.persistBranch(branchPath);
        }
    }

    return BuildStep;
}
