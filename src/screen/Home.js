import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Linking,Image } from 'react-native';

const Home = () => {
    return (
        <View style={styles.container}>
            <ImageBackground style={styles.header}
                source={require('../assets/banner.png')}>
                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceTitle}>Your Power Consumption</Text>
                    <Text style={styles.balanceAmount}>152KWh</Text>
                    <Text style={styles.balanceChange}>Last Month</Text>
                </View>
            </ImageBackground>

            <View style={styles.trendingSection}>
                <Text style={styles.sectionTitle}>Contribution to Nature</Text>
                <View style={styles.currencyContainer}>
                    <View style={styles.currencyBox}>
                        <Text style={styles.currencyName}>Co2 footprint Saved</Text>
                        <Text style={styles.currencyPrice}>117 KG</Text>
                        <Text style={[styles.currencyChange, styles.positiveChange]}>(0.117 t)</Text>
                    </View>
                    <View style={styles.currencyBox}>
                        <Text style={styles.currencyName}>You have Saved</Text>
                        <Text style={styles.currencyPrice}>6</Text>
                        <Text style={[styles.currencyChange, styles.positiveChange]}>Trees</Text>
                    </View>
                </View>
            </View>

            <View style={styles.investSafelySection}>
                <Text style={styles.investSafelyText}>
                    Switching to sustainable products can be tough but brings great environmental benefits. It's a step toward a healthier planet. View the SDGs for more insights on impactful actions.</Text>
                <TouchableOpacity style={styles.learnMoreButton} onPress={() => Linking.openURL('https://sdgs.un.org/goals')}>
                    <Text style={styles.learnMoreButtonText}>Learn More</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.transactionHistorySection}>
                <Image 
                source={require('../assets/car-sensor-circles-cut.gif')}
                style = {{
                    width :250,
                    height:250,
                    alignSelf:'center',
                    marginTop:-20
                }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#6A5ACD', // Adjust the color to match your theme
        paddingTop: 50, // Assuming there's a status bar
        paddingBottom: 20,
        alignItems: 'center',
    },
    time: {
        color: '#fff',
        fontSize: 18,
        position: 'absolute',
        top: 60, // Adjust according to your status bar height
        right: 20,
    },
    balanceContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    balanceTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    balanceAmount: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    balanceChange: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    trendingSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    currencyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    currencyBox: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        width: '48%', // Adjust as necessary
        alignItems: 'center',
        elevation: 3, // For Android shadow
        shadowColor: '#000', // For iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    currencyName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    currencyPrice: {
        fontSize: 16,
        marginBottom: 5,
    },
    currencyChange: {
        fontSize: 14,
        fontWeight: '500',
    },
    positiveChange: {
        color: 'green',
    },
    negativeChange: {
        color: 'red',
    },
    alertButton: {
        backgroundColor: '#FFD700', // Adjust the color to match your theme
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 20,
        marginTop: 10,
        alignItems: 'center',
    },
    alertButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    investSafelySection: {
        backgroundColor: '#f8f8f8',
        padding: 20,
        margin: 20,
        borderRadius: 10,
    },
    investSafelyText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    learnMoreButton: {
        backgroundColor: '#6A5ACD',
        padding: 10,
        borderRadius: 10,
    },
    learnMoreButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    transactionHistorySection: {
        padding: 20,
    },
    transactionHistoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    transactionBox: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        elevation: 3, // For Android shadow
        shadowColor: '#000', // For iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        marginBottom: 10,
    },
    transactionText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    transactionDate: {
        fontSize: 14,
        color: '#666',
    },
});

export default Home;
