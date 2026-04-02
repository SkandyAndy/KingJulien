import localforage from 'localforage';

export const logsStore = localforage.createInstance({
  name: "KJ_BSM_App",
  storeName: "bullshit_logs"
});

export const addLog = async (category, quote = "") => {
  const newLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    category,
    quote
  };
  const currentLogs = await getLogs();
  currentLogs.push(newLog);
  await logsStore.setItem("logs", currentLogs);
  return newLog;
};

export const getLogs = async () => {
  const logs = await logsStore.getItem("logs");
  return logs || [];
};

export const clearLogs = async () => {
  await logsStore.setItem("logs", []);
};
