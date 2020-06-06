import Knex from 'knex';

export async function seed(knex:Knex) {
    await knex('items').insert([
        { title: 'Lâmpadas', image: 'lampadas.svg'},
        { title: 'Pilha e Bateiras', image: 'baterias.svg'},
        { title: 'Papéis e Papelão', image: 'papeis-e-papelao.svg'},
        { title: 'Resíduos Eletrónicos', image: 'eletronicos.svg'},
        { title: 'Resíduos Orgânicos', image: 'organicos.svg'},
        { title: 'Óleo de Cozinha', image: 'oleo.svg'},
    ]);
}