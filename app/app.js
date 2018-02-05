import { manager } from './manager.js';
import { Person } from './Person.js';
import { Animal } from './Animal.js';

(async () => {
    await manager
        .setDbName('cangaceiro')
        .setDbVersion(2) 
        .register(
            { 
                clazz: Person,
                converter: data => new Person(data._name)
            },
            { 
                clazz: Animal,
                converter: data => new Animal(data._name)
            }
        );
        
    const person = new Person('Flávio Almeida');
    const animal = new Animal('Calopsita');

    await manager.save(person);
    await manager.save(animal);

    const persons = await manager.list(Person);
    persons.forEach(console.log);

    const animals = await manager.list(Animal);
    animals.forEach(console.log);

})().catch(console.log);
