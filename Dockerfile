#Indica la imagen base a utilizar
FROM node:18
#Indica el directorio de trabajo
WORKDIR /usr/src/app
#Copia el contenido del directorio actual al directorio de trabajo
COPY . .
#Instala las dependencias
RUN npm install
#Expone el puerto 3000
EXPOSE 3000
#Inicia el servidor
CMD [ "node", "index" ]

#Reconstruir y volver a ejecutar una imagen
#docker-compose down --volumes --rmi all
#docker-compose up --build