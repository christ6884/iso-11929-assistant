import { Source, AnalysisRecord } from '../types';

const DB_NAME = 'ISOAssistantDB';
const DB_VERSION = 2; // Incremented version for schema change
const SOURCES_STORE_NAME = 'sources';
const ANALYSES_STORE_NAME = 'analyses';

class DBService {
    private db: IDBDatabase | null = null;

    constructor() {
        this.init();
    }

    private init(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                return resolve();
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(SOURCES_STORE_NAME)) {
                    db.createObjectStore(SOURCES_STORE_NAME, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(ANALYSES_STORE_NAME)) {
                    db.createObjectStore(ANALYSES_STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }

    private async getDb(): Promise<IDBDatabase> {
        if (!this.db) {
            await this.init();
        }
        return this.db!;
    }

    // --- Source Management ---

    public async addSource(sourceData: Omit<Source, 'id'>): Promise<void> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(SOURCES_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(SOURCES_STORE_NAME);
            const newSource: Source = {
                id: crypto.randomUUID(),
                ...sourceData,
            };
            const request = store.add(newSource);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    public async updateSource(source: Source): Promise<void> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(SOURCES_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(SOURCES_STORE_NAME);
            const request = store.put(source);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    public async getAllSources(): Promise<Source[]> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(SOURCES_STORE_NAME, 'readonly');
            const store = transaction.objectStore(SOURCES_STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    public async deleteSource(id: string): Promise<void> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(SOURCES_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(SOURCES_STORE_NAME);
            const request = store.delete(id);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // --- Analysis History Management ---

    public async addAnalysis(record: Omit<AnalysisRecord, 'id' | 'date'>): Promise<void> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(ANALYSES_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(ANALYSES_STORE_NAME);
            // Fix: Cast the constructed record to AnalysisRecord to solve a TypeScript error with discriminated unions and spread syntax.
            const newRecord = {
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
                ...record,
            } as AnalysisRecord;
            const request = store.add(newRecord);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
    
    public async getAllAnalyses(): Promise<AnalysisRecord[]> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(ANALYSES_STORE_NAME, 'readonly');
            const store = transaction.objectStore(ANALYSES_STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => {
                // Sort by date descending
                const sorted = request.result.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                resolve(sorted);
            }
            request.onerror = () => reject(request.error);
        });
    }

    public async deleteAnalysis(id: string): Promise<void> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(ANALYSES_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(ANALYSES_STORE_NAME);
            const request = store.delete(id);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
}

export const db = new DBService();