import React, { useState, useEffect } from 'react';
import { Feather as Icon} from '@expo/vector-icons';
import { View, ImageBackground, Text, StyleSheet, Image, TextInput, KeyboardAvoidingView, Platform, SafeAreaView, Alert } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import PickerSelect from 'react-native-picker-select';
import axios from 'axios';

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        marginVertical: 3,
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#34CB79',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        marginVertical: 3,
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 2,
        borderColor: '#34CB79',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
});
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

interface PickerSelectItem{
    label: string,
    value: string,
    key: string
}

const Home = () => {
    const [UFs, setUFs] = useState([]);
    const [cities, setCities] = useState([]);

    const [selectedUF, setSelectedUF] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const navigation = useNavigation();

    function handleNavegateToPoints() {
        if(!selectedUF){
            Alert.alert('','É necessário selecionar uma UF para entrar');
            return
        }

        if(!selectedCity){
            Alert.alert('','É necessário selecionar uma cidade para entrar');
            return
        }

        navigation.navigate('Points', {
            uf: selectedUF,
            city: selectedCity
        });
    }

    // Chamada para a API do IBGE para uma lista de UFs
    useEffect(() => {
        axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados/')
        .then(res => {
            
            const UFsMapped = res.data.map((uf: IBGE_UF_RESPONSE) => {
                const newUF :  PickerSelectItem = { label: uf.sigla, value: String(uf.sigla), key: String(uf.sigla)} ;
                return newUF;
            });
            setUFs( UFsMapped );
            
        })
        .catch(() => {
            Alert.alert('Ooops', 'Ocorreu um erro, verifique sua internet');
        });
    }, []);

    
    // Chamada para a API do IBGE para uma lista de Municípios
    useEffect(() => {
        
        if (!selectedUF) {
            return
        }
        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
        .then(res => {
            
            const citiesMapped = res.data.map((city: IBGE_CITY_RESPONSE) => {
                const newCity :  PickerSelectItem = { label: city.nome, value: String(city.id), key: String(city.id)} ;
                return newCity;
            });
            setCities( citiesMapped );

        });

    }, [selectedUF])

    function handleSelectUF(uf: string) {
        if(!uf){
            return
        }
        setSelectedUF(uf);
    }

    function handleSelectCity(city: string) {
        setSelectedCity(city);
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <SafeAreaView
                style={{ flex: 1 }}
            >
                <ImageBackground 
                    style={styles.container} 
                    source={require('../../assets/home-background.png')}
                    imageStyle={{width: 274, height: 368}}
                >
                    <View style={styles.main}>
                        <Image source={require('../../assets/logo.png')} />
                        <View>
                            <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>

                            <Text style={styles.description} >Ajudamos pessoas a encontrarem pontos de coleta de uma forma eficiente</Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        
                        {UFs && 
                        <PickerSelect
                            onValueChange={(value) => handleSelectUF(value)}
                            items={UFs}
                            placeholder={{label: 'Selecione uma UF', value: null}}
                            useNativeAndroidPickerStyle={false}
                            style={{
                                ...pickerSelectStyles,
                                iconContainer: {
                                    top: 10,
                                    right: 12,
                                },
                            }}
                            
                        />}
                        {cities && 
                        <PickerSelect
                            onValueChange={(value) => handleSelectCity(value)}
                            items={cities}
                            placeholder={{label: 'Selecione uma Cidade', value: null}}
                            useNativeAndroidPickerStyle={false}
                            style={{
                                ...pickerSelectStyles,
                                iconContainer: {
                                    top: 10,
                                    right: 12,
                                },
                            }}
                            
                        />}
                       
                        
                        <RectButton style={styles.button} onPress={handleNavegateToPoints}>
                            <View style={styles.buttonIcon}>
                                <Text>
                                    <Icon name='arrow-right' color='#FFF' size={24}/>
                                </Text>
                            </View>
                            <Text style={styles.buttonText}>
                                Entrar
                            </Text>
                        </RectButton>
                    </View>
                </ImageBackground>
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
}

export default Home;
