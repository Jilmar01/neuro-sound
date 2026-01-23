//datos mapa de toda la encuesta
emotions =[
    "tristeza",
    "calma",
    "felicidad",
    "ira"
] //esto es como el usuario se siente en ese momento

intensity = [
    1,2,3,4,5
]//de 1 es muy leve y 5 es muy fuerte
tones = [
    group = {
    "tristeza":[110,174,210],
    "calma":[285,396,417],
    "felicidad":[440,528,639],
    "ira":[741,852,963]
    }//estas son frecuencias puras en hz que el usuario fue sometido a escuchar dependiendo de la emocion que selecciono
,
    molestias = {
        "tone1":[1,2,3,4,5],
        "tone2":[1,2,3,4,5],
        "tone3":[1,2,3,4,5]
    },//estas son de cada set de audios para cada emocion cual le resulto mas tolerable 1 a menos tolerable o molesto 5
    favorite = "tone x", //cual de los 3 tonos le resulto mejor
    least_favorite ="tone y" // cual le resulto peor
]

generes = [
  "Blues",
  "Indie",
  "Reggae",
  "Soul",
  "Ambient",
  "House",
  "Reggaeton",
  "Rock",
  "Classical",
  "Pop",
  "Folk",
  "Metal",
  "EDM",
  "Hip-Hop",
  "K-Pop",
  "Country",
  "RnB",
  "Jazz",
  "Lofi",
  "Gospel"
];//de aqui el usuario selecciona solo lo que le gusta

artist_preference = [
    ""
]//este es un arreglo que el usuario llena manualmente con sus artistas favoritos separandolos con una coma para que se pueda identificar como parte del arreglo y no todo unido

tempo_preference = [
    "muy lentas y solemnes",
    "lentas y tranquilas",
    "ritmo moderado",
    "rapidas y animadas",
    "muy rapidas e intensas"
] //este es el tipo de canciones o ritmos que le gusta en sus canciones

intent = [
    1,2,3,4,5
]/*este es como se quiere sentir el usuario con la sesion que va
    1 = mantener como me siento
    2 = sentirme mas feliz
    3 = relajarme
    4 = aumentar mi energia
    5 = ayudame a concentrarme
*/




