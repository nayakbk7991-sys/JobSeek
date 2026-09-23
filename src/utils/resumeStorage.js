const DB_NAME =
  "JobSeekDB";

const STORE_NAME =
  "resumes";

const DB_VERSION = 1;

function openDatabase() {
  return new Promise(
    (resolve, reject) => {
      const request =
        indexedDB.open(
          DB_NAME,
          DB_VERSION
        );

      request.onupgradeneeded =
        (event) => {
          const database =
            event.target.result;

          if (
            !database.objectStoreNames.contains(
              STORE_NAME
            )
          ) {
            database.createObjectStore(
              STORE_NAME,
              {
                keyPath: "id"
              }
            );
          }
        };

      request.onsuccess = () => {
        resolve(
          request.result
        );
      };

      request.onerror = () => {
        reject(
          request.error
        );
      };
    }
  );
}

function createResumeId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
}

export async function saveResume(
  file
) {
  if (!(file instanceof File)) {
    throw new Error(
      "Invalid resume file."
    );
  }

  const database =
    await openDatabase();

  const resumeId =
    createResumeId();

  return new Promise(
    (resolve, reject) => {
      const transaction =
        database.transaction(
          STORE_NAME,
          "readwrite"
        );

      const store =
        transaction.objectStore(
          STORE_NAME
        );

      const request =
        store.put({
          id: resumeId,
          file
        });

      request.onsuccess = () => {
        database.close();

        resolve(
          resumeId
        );
      };

      request.onerror = () => {
        database.close();

        reject(
          request.error ||
            new Error(
              "Unable to save resume."
            )
        );
      };

      transaction.onerror = () => {
        database.close();

        reject(
          transaction.error ||
            new Error(
              "Unable to save resume."
            )
        );
      };
    }
  );
}

export async function getResume(
  resumeId
) {
  if (!resumeId) {
    return null;
  }

  const database =
    await openDatabase();

  return new Promise(
    (resolve, reject) => {
      const transaction =
        database.transaction(
          STORE_NAME,
          "readonly"
        );

      const store =
        transaction.objectStore(
          STORE_NAME
        );

      const request =
        store.get(
          resumeId
        );

      request.onsuccess = () => {
        database.close();

        if (
          request.result
        ) {
          resolve(
            request.result.file
          );
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        database.close();

        reject(
          request.error ||
            new Error(
              "Unable to retrieve resume."
            )
        );
      };

      transaction.onerror = () => {
        database.close();

        reject(
          transaction.error ||
            new Error(
              "Unable to retrieve resume."
            )
        );
      };
    }
  );
}

export async function resumeExists(
  resumeId
) {
  if (!resumeId) {
    return false;
  }

  const database =
    await openDatabase();

  return new Promise(
    (resolve, reject) => {
      const transaction =
        database.transaction(
          STORE_NAME,
          "readonly"
        );

      const store =
        transaction.objectStore(
          STORE_NAME
        );

      const request =
        store.getKey(
          resumeId
        );

      request.onsuccess = () => {
        database.close();

        resolve(
          request.result !==
            undefined
        );
      };

      request.onerror = () => {
        database.close();

        reject(
          request.error ||
            new Error(
              "Unable to check resume."
            )
        );
      };

      transaction.onerror = () => {
        database.close();

        reject(
          transaction.error ||
            new Error(
              "Unable to check resume."
            )
        );
      };
    }
  );
}

export async function deleteResume(
  resumeId
) {
  if (!resumeId) {
    return false;
  }

  const database =
    await openDatabase();

  return new Promise(
    (resolve, reject) => {
      const transaction =
        database.transaction(
          STORE_NAME,
          "readwrite"
        );

      const store =
        transaction.objectStore(
          STORE_NAME
        );

      const request =
        store.delete(
          resumeId
        );

      request.onsuccess = () => {
        database.close();

        resolve(true);
      };

      request.onerror = () => {
        database.close();

        reject(
          request.error ||
            new Error(
              "Unable to delete resume."
            )
        );
      };

      transaction.onerror = () => {
        database.close();

        reject(
          transaction.error ||
            new Error(
              "Unable to delete resume."
            )
        );
      };
    }
  );
}