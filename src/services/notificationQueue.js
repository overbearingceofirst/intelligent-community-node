const fs = require("fs");
const path = require("path");
const notificationService = require("./notificationService");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const QUEUE_FILE = path.join(DATA_DIR, "notification_queue.json");
const TMP_FILE = path.join(DATA_DIR, "notification_queue.json.tmp");

let queue = [];
let running = false;
let saveTimer = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadQueueFromDisk() {
  try {
    ensureDataDir();
    if (!fs.existsSync(QUEUE_FILE)) return;
    const raw = fs.readFileSync(QUEUE_FILE, "utf8");
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      queue = arr;
      console.log(`[notificationQueue] loaded ${queue.length} jobs from disk`);
    }
  } catch (err) {
    console.error("[notificationQueue] loadQueueFromDisk error", err);
  }
}

function saveQueueToDiskSync() {
  try {
    ensureDataDir();
    const data = JSON.stringify(queue || []);
    fs.writeFileSync(TMP_FILE, data, { encoding: "utf8" });
    fs.renameSync(TMP_FILE, QUEUE_FILE);
  } catch (err) {
    console.error("[notificationQueue] saveQueueToDiskSync error", err);
  }
}

// 节流写盘：短时间内多次 enqueue 只写一次
function scheduleSave(delay = 500) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveQueueToDiskSync();
    saveTimer = null;
  }, delay);
}

function enqueue(job) {
  // job: { user_id, title, body, meta }
  queue.push(job);
  scheduleSave();
}

// 处理单个 job：调用实际的 createNotification（而非 notifyUser 入队）
async function processJob(job) {
  try {
    await notificationService.createNotification(
      job.user_id,
      job.title,
      job.body,
      job.meta || null,
    );
    // 可扩展：在此触发 push provider
    return true;
  } catch (err) {
    console.error("[notificationQueue] processJob error", err);
    return false;
  }
}

function start(intervalMs = 1000) {
  if (running) return;
  running = true;
  // 启动前先从磁盘恢复
  loadQueueFromDisk();

  setInterval(async () => {
    if (!queue.length) return;
    const job = queue.shift();
    try {
      const ok = await processJob(job);
      if (!ok) {
        // 失败时简单重试：把任务放回队列尾部并等下次重试
        queue.push(job);
      }
    } catch (err) {
      console.error("[notificationQueue] worker unexpected error", err);
      queue.push(job);
    } finally {
      // 处理后立即同步保存队列状态（节流也在起作用）
      scheduleSave(100);
    }
  }, intervalMs);
}

function stop() {
  running = false;
  // 立即写盘
  saveQueueToDiskSync();
}

module.exports = { enqueue, start, stop };
