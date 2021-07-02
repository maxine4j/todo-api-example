FROM flyway/flyway:7.5.2-alpine

COPY ./todo /flyway/sql

ENTRYPOINT [ "sh" ]
CMD ["-c", "flyway -url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME} -user=${DB_USER} -password=${DB_PASSWORD} -schemas=todo_api migrate"]
