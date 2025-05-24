package main

import (
	"fmt"
	"os"
)

//TIP <p>To run your code, right-click the code and select <b>Run</b>.</p> <p>Alternatively, click
// the <icon src="AllIcons.Actions.Execute"/> icon in the gutter and select the <b>Run</b> menu item from here.</p>

func main() {
	fmt.Println("Welcome to the Online Store API!")
	fmt.Println("To start the server, use:")
	fmt.Println("  go run cmd/api/main.go")

	fmt.Println("\nMake sure you have PostgreSQL running and configured in .env")
	fmt.Println("For API documentation, visit http://localhost:8080/api/swagger/index.html after starting the server")

	os.Exit(0)
}
