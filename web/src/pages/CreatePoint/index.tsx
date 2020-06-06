import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import _ from 'lodash';
import { LeafletMouseEvent } from 'leaflet';
import './CreatePoint.css';
import { FiArrowLeft } from 'react-icons/fi';
import logo from '../../assets/logo.svg';

import axios from 'axios';

import api from '../../services/api';

interface Item{
    id: number,
    title: string,
    image: string,
    image_url: string
}

interface IBGE_UF_RESPONSE{
    id: number,
    sigla: string,
    nome: string,
    regiao: object
}
interface IBGE_CITY_RESPONSE{
    id: number,
    nome: string,
    microrregiao: object
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [UFs, setUFs] = useState<IBGE_UF_RESPONSE[]>([]);
    const [cities, setCities] = useState<IBGE_CITY_RESPONSE[]>([]);

    const [selectedCity, setSelectedCity] = useState('');
    const [selectedUF, setSelectedUF] = useState('');
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);

    const [textInput, setTextInput] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });

    const [latLng, setLatLng] = useState<[number, number]>([0, 0]);
    const [initialLatLng, setInitialLatLng] = useState<[number, number]>([-20.029435, -46.474464]);

    const [isSubmiting, setIsSubmiting] = useState(false);

    const history = useHistory();

    // Pegando geolocation
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            setInitialLatLng([
                position.coords.latitude,
                position.coords.longitude
            ]);
        })
    }, [])
    
    // Chamada para o backend para uma lista de itens
    useEffect(() => {
        api.get('items').then(res => {
            setItems(res.data.items);
        });
    }, []);

    // Chamada para a API do IBGE para uma lista de UFs
    useEffect(() => {
        axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados/')
        .then(res => {
            setUFs( res.data )
        });
    }, []);

    // Chamada para a API do IBGE para uma lista de Municípios
    useEffect(() => {
        
        if (!selectedUF) {
            return
        }
        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
        .then(res => {
            setCities( res.data );
        });

    }, [selectedUF])

    function handleMapClick(e: LeafletMouseEvent) {
        setLatLng( [
            e.latlng.lat,
            e.latlng.lng
        ] );
    }

    function handleInputChange(e : ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setTextInput({
            ...textInput,
            [name]: value
        });
    }

    function handleSelectItem(item: Item) {

        if( _.includes(selectedItems, item) ){
            setSelectedItems(
                selectedItems.filter(i => i.id != item.id )
            )
            return
        }

        setSelectedItems([
            ...selectedItems,
            item
        ])
        
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        
        setIsSubmiting(true);

        const { name, email, whatsapp } = textInput;
        const [ latitude, longitude ] = latLng;
        const uf = selectedUF;
        const city = selectedCity;
        const items = selectedItems.map(item => item.id);

        const data = {
            name, 
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }

        try {
            await api.post('points', data);
            
            alert('Ponto de coleta cadastrado com sucesso!');
            history.push('/');
        } catch (error) {
            
            alert('Ocorreu um erro no cadastramento do ponto de coleta. Tente novamente mais tarde');
        } finally{

            setIsSubmiting(false);
        }
        

    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Logo"/>

                <Link to='/'>
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> Ponto de Coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                        
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name='name'
                            id='name'
                            onChange={handleInputChange}
                            />
                    </div>

                    <div className="field-group">

                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="text"
                                name='email'
                                id='email'
                                onChange={handleInputChange}
                                />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name='whatsapp'
                                id='whatsapp'
                                onChange={handleInputChange}
                                />
                        </div>
                    </div>
                </fieldset>
                
                <fieldset>
                    <legend>
                        <h2>Endereços</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialLatLng} zoom={( _.isEqual(initialLatLng, [-20.029435, -46.474464]) )? 3 : 15}  onclick={handleMapClick}>
                        <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={latLng} >
                            
                        </Marker>
                    </Map>

                    <div className="field-group">

                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>

                            <select 
                                name="uf" 
                                id="uf"  
                                value={selectedUF}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedUF(e.target.value)}
                            >
                                <option value='' >Selecione uma UF</option>

                                {UFs.map((uf: IBGE_UF_RESPONSE) => (

                                    <option key={uf.id} value={uf.sigla} >{uf.sigla}</option>
                                ) )}

                            </select>
                        </div>
                        
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"  
                                value={selectedCity}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCity(e.target.value)}
                            >

                                <option value='' >Selecione uma cidade</option>

                                {cities.map((city: IBGE_CITY_RESPONSE) => (

                                    <option key={city.id} value={city.nome} >{city.nome}</option>
                                ) )}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione os ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">

                        {items.map((item) => {
                            return (
                                <li 
                                    key={item.id}  
                                    className={_.includes(selectedItems, item) ? 'selected': ''}
                                    onClick={() => handleSelectItem(item)} 
                                >
                                    <img src={item.image_url} alt="teste"/>
                                    <span>{item.title}</span>
                                </li>
                            )
                        })}
                        
                    </ul>
                </fieldset>

                <button type='submit' disabled={isSubmiting ? true : false}>
                    {isSubmiting? '...' : 'Cadastrar ponto de coleta'}
                </button>
            </form>
        </div>
    )
}

export default CreatePoint;