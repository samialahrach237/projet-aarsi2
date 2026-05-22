const { execSync } = require("child_process");
const net = require("net");

const port = Number(process.argv[2] || process.env.PORT || 8080);
const host = process.env.HOST || "localhost";

function isPortFree(targetPort, targetHost) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(targetPort, targetHost);
  });
}

function getWindowsPids(targetPort) {
  const output = execSync(`netstat -ano | findstr :${targetPort}`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  return [...new Set(
    output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(/\s+/).pop())
      .filter((pid) => pid && pid !== "0")
  )];
}

function getUnixPids(targetPort) {
  const output = execSync(`lsof -ti tcp:${targetPort}`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  return [...new Set(output.split(/\r?\n/).map((pid) => pid.trim()).filter(Boolean))];
}

function terminatePid(pid) {
  if (process.platform === "win32") {
    execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
    return;
  }

  execSync(`kill -9 ${pid}`, { stdio: "ignore" });
}

async function ensurePortAvailable() {
  if (await isPortFree(port, host)) {
    console.log(`[ensure-port] ${host}:${port} is available.`);
    return;
  }

  console.log(`[ensure-port] ${host}:${port} is busy. Releasing it before startup...`);

  try {
    const pids =
      process.platform === "win32" ? getWindowsPids(port) : getUnixPids(port);

    if (!pids.length) {
      throw new Error(`No process found on port ${port}.`);
    }

    pids.forEach(terminatePid);

    if (!(await isPortFree(port, host))) {
      throw new Error(`Port ${port} is still unavailable after cleanup.`);
    }

    console.log(`[ensure-port] ${host}:${port} is ready.`);
  } catch (error) {
    console.error(`[ensure-port] Unable to free port ${port}: ${error.message}`);
    process.exit(1);
  }
}

ensurePortAvailable();
