import React,{useEffect,useState}from'react';
import {ActivityIndicator,View}from'react-native';
import {SafeAreaProvider,SafeAreaView}from'react-native-safe-area-context';
import {Provider}from'react-redux';
import {StatusBar}from'expo-status-bar';
import AsyncStorage from'@react-native-async-storage/async-storage';
import {store}from'./src/store';
import {CompetitionScreen}from'./src/screens/CompetitionScreen';
import {BottomTabs}from'./src/components/BottomTabs';
import {Home,Catalog,Profile}from'./src/screens/ListScreens';
import {labels,language,saveLanguage}from'./src/i18n';
import {AuthScreen}from'./src/screens/AuthScreen';
import {api}from'./src/api/client';
import {clearSession}from'./src/api/session';
function Shell(){const[tab,setTab]=useState('home'),[detailId,setDetailId]=useState(null),[lang,setLang]=useState('en'),[auth,setAuth]=useState({status:'loading',user:null});useEffect(()=>{language().then(setLang)},[]);useEffect(()=>{let active=true;const restore=async()=>{const token=await AsyncStorage.getItem('feedants_token');if(!token){if(active)setAuth({status:'ready',user:null});return}try{const{data}=await api.get('/users/me');if(active)setAuth({status:'ready',user:data})}catch{await clearSession();if(active)setAuth({status:'ready',user:null})}};restore();return()=>{active=false}},[]);const changeLanguage=async(value)=>{setLang(value);await saveLanguage(value)};const logout=async()=>{await clearSession();setDetailId(null);setTab('home');setAuth({status:'ready',user:null})};const authenticated=async()=>{try{const{data}=await api.get('/users/me');setAuth({status:'ready',user:data})}catch{await clearSession();setAuth({status:'ready',user:null})}};const t=labels[lang];if(auth.status==='loading')return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator/><StatusBar style="dark"/></View>;if(!auth.user)return <AuthScreen onAuthenticated={authenticated}/>;if(detailId)return <CompetitionScreen competitionId={detailId} onBack={()=>setDetailId(null)} languageCode={lang} setLanguage={changeLanguage} t={t}/>;const screen=tab==='home'?<Home t={t} onDetails={setDetailId}/>:tab==='profile'?<Profile t={t} onLogout={logout}/>:<Catalog t={t} mode={tab==='explore'?'explore':'competitions'} onDetails={setDetailId}/>;return <SafeAreaView style={{flex:1,backgroundColor:'#fbfcff'}}><View style={{flex:1}}>{screen}</View><BottomTabs active={tab} onChange={(x)=>setTab(x==='add'?'competitions':x)} t={t}/></SafeAreaView>}
export default function App(){return <Provider store={store}><SafeAreaProvider><StatusBar style="dark"/><Shell/></SafeAreaProvider></Provider>}
