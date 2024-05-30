const { workspaceRoot } = require('@nrwl/devkit');
const flatten = require('lodash/flatten');
const { ESLint } = require('eslint');
const path = require('node:path');

/**
 * @typedef {import('nx/src/config/task-graph').Task} Task
 * @typedef {import('nx/src/tasks-runner/tasks-runner').TaskStatus} TaskStatus
 * @typedef {import('nx/src/tasks-runner/default-tasks-runner').DefaultTasksRunnerOptions} DefaultTasksRunnerOptions
 * @typedef {import('nx/src/tasks-runner/life-cycle').TaskResult} TaskResult 
 */

/**
 * @param {Task[]} tasks
 * @param {DefaultTasksRunnerOptions} options
 * @param {import('nx/src/hasher/hasher').Hasher} hasher
 */
async function resolveCacheInstance(tasks, options, hasher) {
  try {
    const NxCache = require('nx/src/tasks-runner/cache').Cache;
    const cache = new NxCache(options);

    // calculate hash for all tasks
    await Promise.all(tasks.map(t => hasher.hashTask(t).then(hash => (t.hash = hash.value))));

    return {
      /** @param {Task[]} tasks */
      tryGet: tasks =>
        Promise.all(tasks.map(task => cache.get(task).then(cached => ({ task, cached })))).then(all =>
          all.reduce(
            (result, { task, cached }) => {
              if (cached)
                result.cacheHit.push({
                  task,
                  status: cached.remote ? 'remote-cache' : 'local-cache',
                  code: cached.code,
                  terminalOutput: cached.terminalOutput
                });
              else result.cacheMiss.push(task);

              return result;
            },
            { cacheHit: [], cacheMiss: [] }
          )
        ),
      /** @param {TaskResult[]} results */
      put: results => Promise.all(results.map(r => cache.put(r.task, r.terminalOutput, [], r.code)))
    };
  } catch {
    return {
      /**
       * @param {Task[]} tasks
       * @returns {Promise<{ cacheHit: TaskResult[], cacheMiss: Task[] }>}
       */
      tryGet: tasks => Promise.resolve({ cacheHit: [], cacheMiss: tasks }),
      put: () => Promise.resolve()
    };
  }
}

/**
 * @param {Task[]} tasks
 * @param {import('nx/src/config/project-graph').ProjectGraph} projectGraph
 * @param {DefaultTasksRunnerOptions} options
 * @returns {TaskResult[]}
 */
async function runEslint(tasks, projectGraph, options) {
  if (tasks.length === 0) return [];

  const esLintOptions = {
    cache: tasks[0].overrides?.cache === undefined ? options.cache : tasks[0].overrides.cache !== 'false',
    cacheLocation: tasks[0].overrides?.cacheLocation || options.cacheLocation,
    errorOnUnmatchedPattern: false
  };

  const projects = tasks.map(x => x.target.project);
  // get file patterns for all target from lint options
  const filePatterns = flatten(
    projects.map(project => projectGraph.nodes[project].data.targets.lint.options.lintFilePatterns)
  );

  const eslint = new ESLint(esLintOptions);

  // run eslint for all targets files in a single command
  const allResults = await eslint.lintFiles(filePatterns);

  const formatter = await eslint.loadFormatter('stylish');

  // group lint results by tasks
  return tasks.map(task => {
    const project = projectGraph.nodes[task.target.project].data;
    // get absolute file paths for task target project
    const projectFilePaths = project.files.map(f => path.join(workspaceRoot, f.file));
    // extract lint result for target project files
    const taskLintResults = allResults.filter(r => projectFilePaths.includes(path.normalize(r.filePath)));
    const hasResults = taskLintResults.length > 0;
    const taskOutput = hasResults
      ? formatter.format(taskLintResults) || 'All files pass linting.\n'
      : 'No matched files found.\n';
    const hasError =
      ESLint.getErrorResults(taskLintResults).length > 0 ||
      (!hasResults && project.targets.lint.options.errorOnUnmatchedPattern);

    return { task, status: hasError ? 'failure' : 'success', code: hasError ? 1 : 0, terminalOutput: taskOutput };
  });
}

/** @type {import('nx/src/tasks-runner/tasks-runner').TasksRunner<DefaultTasksRunnerOptions>} */
const eslintTaskRunner = async (tasks, options, context) => {
  if (tasks.some(t => t.target.target !== 'lint'))
    throw new Error('only lint target is supported by eslint TasksRunner');

  options.lifeCycle.startCommand();

  try {
    const cache = await resolveCacheInstance(tasks, options, context.hasher);

    options.lifeCycle.startTasks(tasks);

    const { cacheHit, cacheMiss } = await cache.tryGet(tasks);

    cacheHit.forEach(r => options.lifeCycle.printTaskTerminalOutput(r.task, r.status, r.terminalOutput));

    const tasksResults = await runEslint(cacheMiss, context.projectGraph, options);

    // print lint result for each tasks
    tasksResults.forEach(r => options.lifeCycle.printTaskTerminalOutput(r.task, r.status, r.terminalOutput));

    await cache.put(tasksResults);

    const results = cacheHit.concat(tasksResults);
    // report tasks results
    options.lifeCycle.endTasks(results);

    // return tasks statuses
    return results.reduce((statuses, taskResult) => {
      statuses[taskResult.task.id] = taskResult.status;
      return statuses;
    }, {});
  } finally {
    options.lifeCycle.endCommand();
  }
};

exports.default = eslintTaskRunner;
