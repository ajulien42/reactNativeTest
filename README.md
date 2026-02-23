# React Native Test

Petite application permettant d’ajouter des annotations sur une photo.

La photo (asset) ayant un ratio très allongé, j’ai choisi d’intégrer directement des fonctionnalités de **pan** et de **zoom**.

Les annotations sont ajoutées dans le local storage, et persistent entre les sessions.

Il est possible d’ajouter ou de supprimer une annotation via un **appui long**.

Un **double tap** permet de recentrer l’image et de réinitialiser le zoom.

La façon la plus simple de tester l’application est d’installer l'application **Expo Go** et de scanner le QR code suivant :

<img width="263" height="262" alt="QRcode" src="https://github.com/user-attachments/assets/b69d013a-b32c-4946-9fd3-d5f610ba41e0" />

J’ai également ajouté un écran permettant de choisir ou de prendre des photos.  
Cette partie est un peu hors du scope du test : il n’y a pas vraiment de design, l’objectif était surtout de me refamiliariser avec l’écosystème Expo (expo-router, expo-image-picker, etc.).

Cette fonctionnalité est disponible sur la branche **`takeAndChoosePhoto`** et peut être testée via le QR code suivant :

<img width="265" height="265" alt="Screenshot" src="https://github.com/user-attachments/assets/1f0bef00-8f89-4e7e-a3ef-1e949f527f07" />

Il est également possible de lancer le projet localement avec `npm i` puis `npx expo start` et prendre en photo le QRcode pour faire marcher l'app via expo go sur votre smartphone, sinon il faut un simulateur (ainsi que Xcode et/ou Android Studio).
