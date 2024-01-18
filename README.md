# Lease System

## Projekto uždavinys
Sukurti nuomos sistemą, kurioje nuomininkai gali išnuomoti skirtingus objektus.

<!-- GETTING STARTED -->
## Reikalavimai
mongoDB, node.JS, veikiantis mongo daemon'as

## Naudojimas

1. Nusiklonuoti projektą
2. ```npm install```
3. Esant ```app``` direktorijoje, paleisti ```node server.js```

## API Dokumentacija

```/api/lease```
* ```GET``` - grąžina visų nuomų sąrašą
* ```POST``` - sukuria naują nuomą
  
```/api/lease/:leaseId```
* ```GET``` - grąžina konkrečią nuomą
* ```PATCH``` - atnaujina konkrečią nuomą
* ```DELETE``` - pašalina konkrečią nuomą

```/api/lease/:leaseId/reviews```
* ```GET``` - grąžina visus objekte esančius atsiliepimus

```/api/lease/:leaseId/object```
* ```GET``` - grąžina visų objektų sąrašą
* ```POST``` - sukuria naują objektą
  
```/api/lease/:leaseId/object/:objectId```
* ```GET``` - grąžina konkretų objektą
* ```PATCH``` - atnaujina konkretų objektą
* ```DELETE``` - pašalina konkretų objektą
  
```/api/lease/:leaseId/object/:objectId/review```
* ```GET``` - grąžina visų atsiliepimų sąrašą
* ```POST``` - sukuria naują atsiliepimą

```/api/lease/:leaseId/object/:objectId/review/:reviewId```
* ```GET``` - grąžina konkretų atsiliepimą
* ```PATCH``` - atnaujina konkretų atsiliepimą
* ```DELETE``` - pašalina konkretų atsiliepimą
