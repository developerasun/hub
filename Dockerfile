FROM golang:1.25-alpine AS runtime
RUN apk add --no-cache gcc musl-dev sqlite-dev
WORKDIR /keydian

# pre-copy/cache go.mod for pre-downloading dependencies and only redownloading them in subsequent builds if they change
COPY ./go.mod ./go.sum ./
RUN go mod download

COPY . .
RUN ls -al
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -o ./server.run ./main.go

# @dev multi-stage bulid for less image size
FROM alpine:3.22 AS runner
WORKDIR /keydian
COPY --from=runtime /keydian/server.run .
EXPOSE 3013

CMD ["./server.run"]
