import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { appConfig } from '../config/appConfig';
import { firestoreService } from '../services/firestoreService';

export const useRealTimeCollection = (collectionName, conditions = [], order = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset state
    setLoading(true);
    setData([]);
    setError(null);

    let unsub = null;
    let isMounted = true;

    // Subscribe immediately - no delay needed
    // Use requestAnimationFrame only for state updates to avoid blocking render
    if (appConfig.USE_MOCKS || !db) {
      unsub = firestoreService.subscribeCollection(collectionName, {
        conditions,
        order,
        next: (list) => {
          if (!isMounted) return;
          // Use requestAnimationFrame to defer state update (non-blocking)
          requestAnimationFrame(() => {
            if (isMounted) {
              setData(list);
              setLoading(false);
            }
          });
        },
        error: (err) => {
          if (!isMounted) return;
          setError(err);
          setLoading(false);
        }
      });
    } else {
      try {
        let q = collection(db, collectionName);
        conditions.forEach((c) => {
          q = query(q, where(...c));
        });
        if (order.length > 0) {
          q = query(q, orderBy(...order));
        }
        
        // Subscribe immediately - Firestore will send initial data + updates
        unsub = onSnapshot(
          q,
          (snapshot) => {
            if (!isMounted) return;
            const newData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            // Use requestAnimationFrame to defer state update (non-blocking)
            requestAnimationFrame(() => {
              if (isMounted) {
                setData(newData);
                setLoading(false);
              }
            });
          },
          (err) => {
            if (!isMounted) return;
            console.warn('useRealTime: Firestore snapshot error, falling back to firestoreService:', err);
            setError(err);
            setLoading(false);
            // Fallback to firestoreService
            if (isMounted) {
              const fallbackUnsub = firestoreService.subscribeCollection(collectionName, {
                conditions,
                order,
                next: (list) => {
                  if (isMounted) {
                    requestAnimationFrame(() => {
                      if (isMounted) {
                        setData(list);
                        setLoading(false);
                      }
                    });
                  }
                },
                error: (error) => {
                  if (isMounted) {
                    setError(error);
                    setLoading(false);
                  }
                }
              });
              // Replace unsub with fallback
              unsub = fallbackUnsub;
            }
          }
        );
      } catch (err) {
        console.warn('useRealTime: Firestore error, falling back to firestoreService:', err);
        unsub = firestoreService.subscribeCollection(collectionName, {
          conditions,
          order,
          next: (list) => {
            if (isMounted) {
              requestAnimationFrame(() => {
                if (isMounted) {
                  setData(list);
                  setLoading(false);
                }
              });
            }
          },
          error: (error) => {
            if (isMounted) {
              setError(error);
              setLoading(false);
            }
          }
        });
      }
    }

    return () => {
      isMounted = false;
      if (unsub && typeof unsub === 'function') {
        unsub();
      }
    };
  }, [collectionName, JSON.stringify(conditions), JSON.stringify(order)]); // Note: JSON.stringify in deps can cause re-renders, but needed for deep comparison

  return { data, loading, error };
};

