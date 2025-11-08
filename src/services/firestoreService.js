import { appConfig } from '../config/appConfig';
import { offlineService } from './offlineService';

let firebaseDb;
let firebaseCollection;
let firebaseAddDoc;
let firebaseGetDoc;
let firebaseSetDoc;
let firebaseUpdateDoc;
let firebaseDeleteDoc;
let firebaseDoc;
let firebaseOnSnapshot;
let firebaseQuery;
let firebaseWhere;
let firebaseOrderBy;
let firebaseGetDocs;

if (!appConfig.USE_MOCKS) {
  const { db } = require('../config/firebase');
  const { collection, addDoc, getDoc, setDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, orderBy, getDocs } = require('firebase/firestore');
  firebaseDb = db;
  firebaseCollection = collection;
  firebaseAddDoc = addDoc;
  firebaseGetDoc = getDoc;
  firebaseSetDoc = setDoc;
  firebaseUpdateDoc = updateDoc;
  firebaseDeleteDoc = deleteDoc;
  firebaseDoc = doc;
  firebaseOnSnapshot = onSnapshot;
  firebaseQuery = query;
  firebaseWhere = where;
  firebaseOrderBy = orderBy;
  firebaseGetDocs = getDocs;
}

import { seedMemoryDb } from './seedMockData';

// Simple in-memory store for mock mode
const memoryDb = {
  users: [],
  tables: [],
  menu: [],
  addons: [],
  orders: []
};

function ensureSeeded() {
  if (memoryDb.menu.length === 0) {
    seedMemoryDb(memoryDb);
  }
}

export const firestoreService = {
  subscribeCollection: (collectionName, { conditions = [], order = [], next, error }) => {
    if (appConfig.USE_MOCKS || !firebaseDb) {
      ensureSeeded();
      const data = memoryDb[collectionName] || [];
      setTimeout(() => next(data), 0);
      // Cache data for offline use (async, don't block)
      offlineService.cacheCollection(collectionName, data).catch(err => {
        console.error('Error caching collection:', err);
      });
      return () => {};
    }
    try {
    let q = firebaseCollection(firebaseDb, collectionName);
    conditions.forEach((c) => (q = firebaseQuery(q, firebaseWhere(...c))));
    if (order.length > 0) q = firebaseQuery(q, firebaseOrderBy(...order));
    const unsub = firebaseOnSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Cache data for offline use (async, don't block)
      offlineService.cacheCollection(collectionName, list).catch(err => {
        console.error('Error caching collection:', err);
      });
      next(list);
    }, (err) => {
      // On error, try to use cached data (async)
      offlineService.getCachedCollection(collectionName).then(cachedData => {
        if (cachedData) {
          console.warn('Using cached data due to subscription error:', err);
          next(cachedData);
          offlineService.setNetworkStatus(false);
          return;
        }
        // Handle index errors gracefully
        if (err?.code === 'failed-precondition' && err?.message?.includes('index')) {
          console.error('⚠️ Firestore index required. Please deploy indexes:');
          console.error('Run: firebase deploy --only firestore:indexes');
          console.error('Or create the index manually in Firebase Console');
          console.error('Error details:', err.message);
          // Still call the error callback if provided
          if (error) error(err);
          // Fall back to mock data
          ensureSeeded();
          const data = memoryDb[collectionName] || [];
          setTimeout(() => next(data), 0);
        } else {
          // Call error callback if provided
          if (error) error(err);
          else {
            console.warn('Firestore subscription error, using mock data:', err);
            ensureSeeded();
            const data = memoryDb[collectionName] || [];
            setTimeout(() => next(data), 0);
          }
        }
      }).catch(cacheErr => {
        console.error('Error getting cached data:', cacheErr);
        // Fallback to mock data
        ensureSeeded();
        const data = memoryDb[collectionName] || [];
        setTimeout(() => next(data), 0);
      });
    });
    return unsub;
    } catch (err) {
      console.warn('Firestore subscription failed, using mock data:', err);
      ensureSeeded();
      const data = memoryDb[collectionName] || [];
      setTimeout(() => next(data), 0);
      return () => {};
    }
  },

  addDocument: async (collectionName, data) => {
    if (appConfig.USE_MOCKS || !firebaseDb) {
      const id = `mock-${Date.now()}`;
      const item = { id, ...data };
      memoryDb[collectionName] = memoryDb[collectionName] || [];
      memoryDb[collectionName].push(item);
      return { id };
    }
    try {
    const ref = await firebaseAddDoc(firebaseCollection(firebaseDb, collectionName), data);
    offlineService.setNetworkStatus(true);
    return { id: ref.id };
    } catch (err) {
      // Check if it's a network error
      if (err.code === 'unavailable' || err.code === 'deadline-exceeded' || err.message?.includes('network')) {
        console.warn('Network error, queueing operation for offline sync:', err);
        offlineService.setNetworkStatus(false);
        // Queue operation for offline sync (async, don't block)
        offlineService.queueOperation({
          type: 'add',
          collection: collectionName,
          data: data,
        }).catch(queueErr => {
          console.error('Error queueing operation:', queueErr);
        });
        // Return a temporary ID
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return { id: tempId, queued: true };
      }
      console.warn('Firestore add failed, using mock:', err);
      const id = `mock-${Date.now()}`;
      const item = { id, ...data };
      memoryDb[collectionName] = memoryDb[collectionName] || [];
      memoryDb[collectionName].push(item);
      return { id };
    }
  },

  updateDocument: async (collectionName, id, data) => {
    if (appConfig.USE_MOCKS || !firebaseDb) {
      const list = memoryDb[collectionName] || [];
      const idx = list.findIndex((i) => i.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...data };
      }
      return true;
    }
    try {
      await firebaseUpdateDoc(firebaseDoc(firebaseDb, `${collectionName}/${id}`), data);
      offlineService.setNetworkStatus(true);
      return true;
    } catch (err) {
      // Check if it's a network error
      if (err.code === 'unavailable' || err.code === 'deadline-exceeded' || err.message?.includes('network')) {
        console.warn('Network error, queueing operation for offline sync:', err);
        offlineService.setNetworkStatus(false);
        // Queue operation for offline sync (async, don't block)
        offlineService.queueOperation({
          type: 'update',
          collection: collectionName,
          id: id,
          data: data,
        }).catch(queueErr => {
          console.error('Error queueing operation:', queueErr);
        });
        return { queued: true };
      }
      console.warn('Firestore update failed, using mock:', err);
      const list = memoryDb[collectionName] || [];
      const idx = list.findIndex((i) => i.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...data };
      }
      return true;
    }
  },

  upsertDocument: async (collectionName, id, data) => {
    if (appConfig.USE_MOCKS || !firebaseDb) {
      memoryDb[collectionName] = memoryDb[collectionName] || [];
      const idx = memoryDb[collectionName].findIndex((i) => i.id === id);
      if (idx >= 0) memoryDb[collectionName][idx] = { ...memoryDb[collectionName][idx], ...data, id };
      else memoryDb[collectionName].push({ id, ...data });
      return true;
    }
    try {
    await firebaseSetDoc(firebaseDoc(firebaseDb, `${collectionName}/${id}`), data, { merge: true });
    offlineService.setNetworkStatus(true);
    return true;
    } catch (err) {
      // Check if it's a network error
      if (err.code === 'unavailable' || err.code === 'deadline-exceeded' || err.message?.includes('network')) {
        console.warn('Network error, queueing operation for offline sync:', err);
        offlineService.setNetworkStatus(false);
        // Queue operation for offline sync (async, don't block)
        offlineService.queueOperation({
          type: 'upsert',
          collection: collectionName,
          id: id,
          data: data,
        }).catch(queueErr => {
          console.error('Error queueing operation:', queueErr);
        });
        return { queued: true };
      }
      console.warn('Firestore upsert failed, using mock:', err);
      memoryDb[collectionName] = memoryDb[collectionName] || [];
      const idx = memoryDb[collectionName].findIndex((i) => i.id === id);
      if (idx >= 0) memoryDb[collectionName][idx] = { ...memoryDb[collectionName][idx], ...data, id };
      else memoryDb[collectionName].push({ id, ...data });
      return true;
    }
  },

  deleteDocument: async (collectionName, id) => {
    if (appConfig.USE_MOCKS || !firebaseDb) {
      memoryDb[collectionName] = (memoryDb[collectionName] || []).filter((i) => i.id !== id);
      return true;
    }
    try {
      await firebaseDeleteDoc(firebaseDoc(firebaseDb, `${collectionName}/${id}`));
      offlineService.setNetworkStatus(true);
      return true;
    } catch (err) {
      // Check if it's a network error
      if (err.code === 'unavailable' || err.code === 'deadline-exceeded' || err.message?.includes('network')) {
        console.warn('Network error, queueing operation for offline sync:', err);
        offlineService.setNetworkStatus(false);
        // Queue operation for offline sync (async, don't block)
        offlineService.queueOperation({
          type: 'delete',
          collection: collectionName,
          id: id,
        }).catch(queueErr => {
          console.error('Error queueing operation:', queueErr);
        });
        return { queued: true };
      }
      console.warn('Firestore delete failed, using mock:', err);
      memoryDb[collectionName] = (memoryDb[collectionName] || []).filter((i) => i.id !== id);
      return true;
    }
  },

  getCollectionOnce: async (collectionName, conditions = [], order = []) => {
    if (appConfig.USE_MOCKS || !firebaseDb) {
      ensureSeeded();
      let data = [...(memoryDb[collectionName] || [])];
      // Apply conditions
      conditions.forEach(([field, op, value]) => {
        if (op === '==') {
          data = data.filter(item => item[field] === value);
        } else if (op === '>=') {
          data = data.filter(item => item[field] >= value);
        } else if (op === '>') {
          data = data.filter(item => item[field] > value);
        } else if (op === '<=') {
          data = data.filter(item => item[field] <= value);
        } else if (op === '<') {
          data = data.filter(item => item[field] < value);
        }
      });
      // Apply ordering
      if (order.length > 0) {
        const [field, direction] = order;
        data.sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];
          if (direction === 'desc') {
            return bVal > aVal ? 1 : -1;
          }
          return aVal > bVal ? 1 : -1;
        });
      }
      return data;
    }

    try {
      if (!firebaseDb) {
        console.warn('Firestore not initialized, using mock data');
        ensureSeeded();
        return memoryDb[collectionName] || [];
      }
      let q = firebaseCollection(firebaseDb, collectionName);
      conditions.forEach((c) => {
        // Support >= and <= operators
        if (c[1] === '>=' || c[1] === '<=' || c[1] === '>' || c[1] === '<' || c[1] === '==') {
          q = firebaseQuery(q, firebaseWhere(c[0], c[1], c[2]));
        } else {
          // Legacy format support
          q = firebaseQuery(q, firebaseWhere(...c));
        }
      });
      if (order.length > 0) {
        q = firebaseQuery(q, firebaseOrderBy(...order));
      }
      const snapshot = await firebaseGetDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Cache data for offline use (async, don't block)
      offlineService.cacheCollection(collectionName, data).catch(err => {
        console.error('Error caching collection:', err);
      });
      offlineService.setNetworkStatus(true);
      return data;
    } catch (error) {
      console.error('Error getting collection:', error);
      // Try to use cached data (async)
      try {
        const cachedData = await offlineService.getCachedCollection(collectionName);
        if (cachedData) {
          console.warn('Using cached data due to error');
          offlineService.setNetworkStatus(false);
          return cachedData;
        }
      } catch (cacheErr) {
        console.error('Error getting cached data:', cacheErr);
      }
      console.warn('Falling back to mock data');
      ensureSeeded();
      return memoryDb[collectionName] || [];
    }
  },

  /**
   * Get a single document by ID
   */
  getDocument: async (collectionName, id) => {
    if (appConfig.USE_MOCKS || !firebaseDb) {
      ensureSeeded();
      const list = memoryDb[collectionName] || [];
      return list.find((item) => item.id === id) || null;
    }

    try {
      const docSnap = await firebaseGetDoc(firebaseDoc(firebaseDb, `${collectionName}/${id}`));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      console.warn('Falling back to mock data');
      ensureSeeded();
      const list = memoryDb[collectionName] || [];
      return list.find((item) => item.id === id) || null;
    }
  },

  /**
   * Batch write operations
   */
  batchWrite: async (operations) => {
    if (appConfig.USE_MOCKS) {
      // Mock implementation
      operations.forEach((op) => {
        if (op.type === 'set') {
          memoryDb[op.collection] = memoryDb[op.collection] || [];
          const idx = memoryDb[op.collection].findIndex((i) => i.id === op.id);
          if (idx >= 0) {
            memoryDb[op.collection][idx] = { ...memoryDb[op.collection][idx], ...op.data, id: op.id };
          } else {
            memoryDb[op.collection].push({ id: op.id, ...op.data });
          }
        } else if (op.type === 'update') {
          const list = memoryDb[op.collection] || [];
          const idx = list.findIndex((i) => i.id === op.id);
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...op.data };
          }
        } else if (op.type === 'delete') {
          memoryDb[op.collection] = (memoryDb[op.collection] || []).filter((i) => i.id !== op.id);
        }
      });
      return true;
    }

    try {
      const { writeBatch } = require('firebase/firestore');
      const batch = writeBatch(firebaseDb);
      
      operations.forEach((op) => {
        const docRef = firebaseDoc(firebaseDb, `${op.collection}/${op.id}`);
        if (op.type === 'set') {
          batch.set(docRef, op.data, { merge: op.merge || false });
        } else if (op.type === 'update') {
          batch.update(docRef, op.data);
        } else if (op.type === 'delete') {
          batch.delete(docRef);
        }
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error in batch write:', error);
      throw error;
    }
  }
};

