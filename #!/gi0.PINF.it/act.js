
exports.forLIB = function (LIB) {

    const YAML = require('yamljs');

    // TODO: Relocate into common 'sm' library.

    function hash (str) {
        return LIB.CRYPTO.createHash('sha1').update(str).digest('hex');
    }
    function hash7 (str) {
        return hash(str).substring(0, 7);
    }
    async function run (commands, cwd) {
        await LIB.RUNBASH(commands, {
            cwd: cwd,
            progress: true,
            wait: true
        });
    }

    async function ensureBranch (workspace) {
        const branchPath = LIB.PATH.join(workspace.path, '.~', 'gi0.Sourcemint.org~sm', 'branch');
        if (!ensureBranch._ensured) {
            if (!(await LIB.FS.exists(branchPath))) {
                try {
                    await LIB.FS.mkdirs(LIB.PATH.dirname(branchPath));
                    await run(`
                        git clone "file://$(pwd)/.git" "${branchPath}"
                        origin=$(git config --get remote.origin.url)
                        cd "${branchPath}"
                        git remote add sm "$origin"
                    `, workspace.path);
                } catch (err) {
                    LIB.LOGGER.error(`Error while setting up 'sm' branch repository at '${branchPath}':`, err);
                    await LIB.FS.remove(branchPath);
                    throw err;
                }
            }
            ensureBranch._ensured = true;
        }
        return branchPath;
    }

    async function prepareBranch (workspace, branchPath) {
        if (!prepareBranch._prepared) {
            await run(`

                branch=$(git rev-parse --abbrev-ref HEAD)
                commit=$(git rev-parse HEAD)

                cd "${branchPath}"

                git reset --hard

                if [ "$(git rev-parse --abbrev-ref HEAD)" != "sm/$branch" ]; then
                    git checkout -t sm/sm/$branch || true
                    git checkout -b sm/$branch
                fi

                git reset --hard
                git pull sm sm/$branch || true

                git merge origin/$branch -m "[gi0.Sourcemint.org/sm.act] Merge from branch '$branch' at commit '$commit'."

            `, workspace.path);
            prepareBranch._prepared = true;
        }
    }

    async function persistBranch (branchPath) {
        await run(`
            git add -A || true
            git commit -m '[gi0.Sourcemint.org/sm.act] Updated control files.' || true
            git push sm
        `, branchPath);
    }

    function codeblockToYAML (codeblock) {

        let config = codeblock.getCode();

        const format = codeblock.getFormat();

        if (format === 'json') {

            // TODO: Report errors nicely
            config = jsonToYAML(JSON.parse(config));
        } else
        if (
            format !== 'yml' &&
            format !== 'yaml'
        ) {
            // TODO: Use standard Error class that attaches source code location.
            throw new Error(`Unknown code format '${format}'!`);
        }

        // Validate the YAML before we even try and push it.
        try {
            config = YAML.stringify(YAML.parse(config), 8);
        } catch (err) {
            // TODO: Use common error class and attach this on to the error.
            LIB.console.error("YAML that failed parsing:", config);
            LIB.console.error(err);
            throw new Error(`Error parsing YAML:`, err);
        }

        return config;
    }

    async function writeFile (result, path, content) {
        await LIB.FS.outputFile(path, content, 'utf8');
        result.outputPaths[path] = true;
    }

    function yamlToJSON (yaml) {
        return YAML.parse(yaml);
    }

    function jsonToYAML (json) {
        return YAML.stringify(json, 8);
    }

    async function readYAMLFileToJSON (path) {
        if (!(await LIB.FS.exists(path))) return null;
        return yamlToJSON(await LIB.FS.readFile(path, 'utf8'));
    }

    return {
        hash,
        hash7,
        ensureBranch,
        prepareBranch,
        persistBranch,
        codeblockToYAML,
        writeFile,
        jsonToYAML,
        yamlToJSON,
        readYAMLFileToJSON
    };
}
