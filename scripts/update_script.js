import {exec} from "child_process";

// 删除指定的运行时依赖和开发依赖
function removeDependencies(dependencies, devDependencies = []) {
    let removeCommand = 'yarn remove ';
    removeCommand += dependencies.join(' ');

    if (devDependencies.length > 0) {
        removeCommand += ' ' + devDependencies.join(' ');
    }

    return new Promise((resolve, reject) => {
        exec(removeCommand, (err, stdout, stderr) => {
            if (err) {
                reject(`Error removing dependencies: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    });
}

// 安装指定的运行时依赖和开发依赖（包括本地路径依赖）
function installDependencies(dependencies, devDependencies = []) {
    let installCommand = 'yarn add ';
    installCommand += dependencies.join(' ');

    if (devDependencies.length > 0) {
        installCommand += ' --dev ' + devDependencies.join(' ');
    }

    return new Promise((resolve, reject) => {
        exec(installCommand, (err, stdout, stderr) => {
            if (err) {
                reject(`Error installing dependencies: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    });
}

// 示例：删除依赖并安装本地路径依赖
async function updateDependencies() {
    try {
        // 先删除依赖
        await removeDependencies(
            ['subtitle-webapp-rust-crate', 'subtitle-webapp-grpc-web'], // 运行时依赖
            [] // 开发依赖
        );
        console.log('Old dependencies removed.');
        // 然后安装来自本地路径的依赖
        await installDependencies(
            [
                'subtitle-webapp-grpc-web@file:./proto',
                'subtitle-webapp-rust-crate@file:./subtitle-webapp-rust-crate/pkg',
            ], // 安装本地路径依赖
            [] // 安装开发依赖
        );
        console.log('New dependencies installed.');
    } catch (error) {
        console.error(error);
    }
}

// 调用函数进行依赖更新
updateDependencies().then();
