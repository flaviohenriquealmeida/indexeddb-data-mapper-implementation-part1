let dbName = 'default';
let dbVersion = 1;
const stores = new Map(); 
let conn = null;

const createConnection = () => 
    new Promise((resolve, reject) => {

        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = e => {

            const transactionalConn = e.target.result;
    
            for (let [key, value] of stores) {

                const store = key;
                
                if(transactionalConn.objectStoreNames.contains(store)) 
                    transactionalConn.deleteObjectStore(store);
                transactionalConn.createObjectStore(store, { autoIncrement: true });
            }     
        };

        request.onsuccess = e => {
            conn = e.target.result; 
            resolve();
        }
        
        request.onerror = e => {
            console.log(e.target.error);
            return Promise.reject('Não foi possível obter a conexão com o banco');
        }; 
    });

class Manager {

    setDbName(name) {
        dbName = name;
        return this;
    }

    setDbVersion(version) {
        dbVersion = version;
        return this;
    }

    async register(...mappers) {
        mappers.forEach(mapper => 
            stores.set(mapper.clazz.name, mapper.converter));
        await createConnection();
    }

    save(object) {
        
        return new Promise((resolve, reject) => {

            if(!conn) return reject('Você precisa registrar o banco antes de utilizá-lo');
            
            const store = object.constructor.name;
            
            const request = conn
                .transaction([store],"readwrite")
                .objectStore(store)
                .add(object);
        
            request.onsuccess = () => resolve();

            request.onerror = e => {
                console.log(e.target.error);
                return reject('Não foi possível persistir o objeto');
            };
        });
    }

    list(clazz) {
        
        return new Promise((resolve, reject) => {
        
            const store = clazz.name;
            
            const transaction = conn
                .transaction([store],'readwrite')
                .objectStore(store); 
            
            const cursor = transaction.openCursor();
      
            const converter = stores.get(store);
      
            const list = [];
      
            cursor.onsuccess = e => {
    
                const current = e.target.result;
    
                 if(current) {
                     list.push(converter(current.value));
                     current.continue();
                } else resolve(list);
            };
    
            cursor.onerror = e => {
                console.log(target.error);
                reject(`Não foi possível lista os dados da store ${store}.`);
            };  
        });    
    }    
}

export const manager = new Manager();