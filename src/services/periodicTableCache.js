const DATABASE_NAME = "mica-chemistry-offline";
const DATABASE_VERSION = 1;
const ELEMENTS_STORE = "elements";

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(ELEMENTS_STORE)) {
        database.createObjectStore(ELEMENTS_STORE, { keyPath: "number" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readCachedElements() {
  const database = await openDatabase();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(ELEMENTS_STORE, "readonly");
      const request = transaction.objectStore(ELEMENTS_STORE).getAll();

      request.onsuccess = () => {
        resolve(request.result.sort((left, right) => left.number - right.number));
      };
      request.onerror = () => reject(request.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export async function saveCachedElements(elements) {
  const database = await openDatabase();

  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(ELEMENTS_STORE, "readwrite");
      const store = transaction.objectStore(ELEMENTS_STORE);

      elements.forEach((element) => store.put(element));
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}
