
const pokeApi = {}

pokeApi.getPokemonCharacteristics = (id) => {
    const url = `https://pokeapi.co/api/v2/characteristic/${id}`;

    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                return {}; // Retorna objeto vazio caso a característica não seja encontrada
            }
            return response.json();
        })
        .then((data) => {
            // Filtrar as descrições no idioma "en" (inglês) e retorná-las como uma string
            return data.descriptions
                ?.filter((desc) => desc.language.name === 'en') // Pega apenas o idioma inglês
                .map((desc) => desc.description)
                .join(', ') || 'Não encontrou caracteristicas';
        })
        .catch((error) => {
            console.error(`Erro ao buscar características para o ID ${id}:`, error);
            return 'Erro ao carregar as caracteristicas';
        });
};


function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon()
    pokemon.number = pokeDetail.id
    pokemon.name = pokeDetail.name

    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name)
    const [type] = types

    pokemon.types = types
    pokemon.type = type

    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default

    return pokemon
}

pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
        .then((response) => response.json())
        .then((pokeDetail) => {
            const pokemon = convertPokeApiDetailToPokemon(pokeDetail);

            // Buscar características adicionais usando o ID do Pokémon
            return pokeApi.getPokemonCharacteristics(pokemon.number).then((characteristics) => {
                pokemon.characteristics = characteristics; // Adicionar características ao objeto Pokémon
                return pokemon;
            });
        });
};


pokeApi.getPokemons = (offset = 0, limit = 5) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`

    return fetch(url)
        .then((response) => response.json())
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonsDetails) => pokemonsDetails)
}