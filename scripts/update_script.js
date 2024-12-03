import fs from "fs";
import path from "path";
import {execSync} from "child_process";

const filesToDelete = ["node_modules/.vite", "node_modules/.vite-temp"];

const devDependenciesToAdd = [];
const devDependenciesToRemove = [];

const runtimeDependenciesToAdd = [{ name: "subtitle-webapp-crate", version: "file:./subtitle-webapp-crate/pkg" }];
const runtimeDependenciesToRemove = ["subtitle-webapp-crate"];

function deleteFiles(files) {
    files.forEach((file) => {
        const filePath = path.resolve(file);
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath, { recursive: true, force: true });
            console.log(`Deleted: ${file}`);
        } else {
            console.log(`File or folder not found: ${file}`);
        }
    });
}

function updateDependencies(removeDevDeps, addDevDeps, removeRuntimeDeps, addRuntimeDeps) {
    const packageJsonPath = path.resolve("package.json");
    if (!fs.existsSync(packageJsonPath)) {
        console.error("package.json not found");
        process.exit(1);
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const devDeps = packageJson.devDependencies || {};
    const runtimeDeps = packageJson.dependencies || {};

    // 删除指定的开发依赖
    removeDevDeps.forEach((dep) => {
        if (devDeps[dep]) {
            delete devDeps[dep];
            console.log(`Removed devDependency: ${dep}`);
        }
    });

    // 删除指定的运行时依赖
    removeRuntimeDeps.forEach((dep) => {
        if (runtimeDeps[dep]) {
            delete runtimeDeps[dep];
            console.log(`Removed runtime dependency: ${dep}`);
        }
    });

    // 更新 package.json
    packageJson.devDependencies = devDeps;

    // 写回 package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf-8");

    // 安装依赖
    execSync("yarn install", { stdio: "inherit" });

    // 添加新的开发依赖
    addDevDeps.forEach(({ name, version }) => {
        if (!devDeps[name]) {
            devDeps[name] = version;
            console.log(`Added devDependency: ${name} -> ${version}`);
        }
    });

    // 添加新的运行时依赖
    addRuntimeDeps.forEach(({ name, version }) => {
        if (!runtimeDeps[name]) {
            runtimeDeps[name] = version;
            console.log(`Added runtime dependency: ${name} -> ${version}`);
        }
    });

    // 更新 package.json
    packageJson.dependencies = runtimeDeps;

    // 写回 package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf-8");

    // 安装依赖
    execSync("yarn install", { stdio: "inherit" });

    console.log("Update dependencies successfully!");
}

(function main() {
    try {
        deleteFiles(filesToDelete);
        updateDependencies(
            devDependenciesToRemove,
            devDependenciesToAdd,
            runtimeDependenciesToRemove,
            runtimeDependenciesToAdd
        );
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
})();