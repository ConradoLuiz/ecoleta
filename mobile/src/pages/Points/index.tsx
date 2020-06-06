import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {Feather as Icon} from '@expo/vector-icons';
import styles from './styles';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as Localtion from 'expo-location';
import _ from 'lodash';

import api from '../../services/api';

interface Item{
    id: number,
    title: string,
    image: string,
    image_url: string
}

interface Point{
    id: number,
    name: string,
    email: string,
    whatsapp: string,
    latitude: number,
    longitude: number,
    uf: string,
    city: string,
    image: string,
}
interface Params{
    uf: string,
    city: string
}

const Points = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [points, setPoints] = useState<Point[]>([]);

    const [selectedItems, setSelectedItems] = useState<Item[]>([]);

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const navigation = useNavigation();

    const route = useRoute();

    const routeParams = route.params as Params;

    // Getting location from device
    useEffect( () => {
        async function loadPosition() {
            const { status } = await Localtion.requestPermissionsAsync();

            if (status !== 'granted'){
                Alert.alert('Ooops...', 'Precisamos da sua permissão para obter a localização');
                return
            }

            const location = await Localtion.getCurrentPositionAsync();
            
            const { latitude, longitude } = location.coords;
            
            setInitialPosition([ latitude, longitude ]);
        }
        loadPosition();
    }, []);

    // Getting recycle points from backend api
    useEffect(() => {
        const params = {
            uf: routeParams.uf,
            city: routeParams.city,
            items: selectedItems.map((item: Item) => item.id).join(', ')
        };
        api.get('points',{
            params
        }).then(res => {
            setPoints(res.data.points);
        });
       
    }, [selectedItems]);

    // Getting recycle items from backend api
    useEffect( () => {
        api.get('items')
        .then(res => {
            setItems(res.data.items);
        })
        .catch(error => {

        })
    }, []);

    function handleNavigateBack() {
        navigation.goBack();    
    }

    function handleNavigateToDetail(point_id: number) {
        navigation.navigate('Detail', { point_id });  
    }

    function handleSelectItem(item:Item) {

        if(_.includes(selectedItems, item)){
            setSelectedItems( selectedItems.filter(i => i.id != item.id))
            return
        }

        setSelectedItems([
            ...selectedItems,
            item
        ]);
    }
    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity>
                    <Icon name='arrow-left' size={24} onPress={handleNavigateBack} color='#34cb79'/>
                </TouchableOpacity>

                <Text style={styles.title}>
                    Bem vindo
                </Text>
                <Text style={styles.description}>
                    Encontre no mapa um ponto de coleta.
                </Text>

                <View style={styles.mapContainer}>
                    {initialPosition[0] != 0 && (
                    <MapView 
                        style={styles.map} 
                        initialRegion={{
                            latitude: initialPosition[0],
                            longitude: initialPosition[1],
                            latitudeDelta: 0.024,
                            longitudeDelta: 0.024,
                        }}
                         

                    >
                        {points && points.map((point:Point) => (
                            <Marker
                                key={String(point.id)}
                                style={styles.mapMarker}
                                onPress={() => handleNavigateToDetail(point.id)}
                                coordinate={{
                                    latitude: point.latitude,
                                    longitude: point.longitude
                                }}
                            >
                                <View style={styles.mapMarkerContainer} > 
                                    <Image 
                                        style={styles.mapMarkerImage}
                                        source={{ 
                                            uri: point.image
                                        }}
                                    />
                                    <Text style={styles.mapMarkerTitle}>
                                        {point.name}
                                    </Text>
                                </View>
                            </Marker>
                        ))}
                    </MapView>
                    )}
                </View>
            </View>
            <View style={styles.itemsContainer}>
                <ScrollView 
                    horizontal  
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                    {items && items.map((item: Item) => (
                        <TouchableOpacity 
                            key={ String(item.id) } 
                            style={ selectedItems.includes( item ) ? { ...styles.item, ...styles.selectedItem} : styles.item  } 
                            // style={styles.item}
                            onPress={() => handleSelectItem(item)}
                            activeOpacity={0.6}
                        >
                            <SvgUri width={42} height={42} uri={item.image_url}/>
                            <Text style={styles.itemTitle}>
                                {item.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </>
    )
}

export default Points
