package main

import (
	"fmt"
	"net/http"
	"os"

	ldap "gopkg.in/ldap.v3"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

// User : User struct to change password.
type User struct {
	ID                 string `json:"id"`
	Password           string `json:"password"`
	NewPassword        string `json:"newPassword"`
	NewPasswordConfirm string `json:"newPasswordConfirm"`
}

// LDAPConnectionError : When failed to connect LDAP Server.
type LDAPConnectionError struct {
	Massage string
}

func (e *LDAPConnectionError) Error() string {
	return "Cannnot connect to LDAP Server."
}

// LDAPModifyPasswordError : When failed to modify password.
type LDAPModifyPasswordError struct {
	Massage string
}

func (e *LDAPModifyPasswordError) Error() string {
	return "Incorrect ID or Password."
}

func change(c echo.Context) error {
	u := &User{}
	if err := c.Bind(u); err != nil {
		return err
	}
	ldap.NewPasswordModifyRequest(u.ID, u.Password, u.NewPassword)
	if err := changePassword(u); err != nil {
		switch err.(type) {
		case *LDAPConnectionError:
			return c.JSON(http.StatusInternalServerError, "Cannnot connect to LDAP Server.")
		default:
			return c.JSON(http.StatusBadRequest, "Incorrect ID or Password.")
		}
	}
	return c.JSON(http.StatusOK, u)
}

func changePassword(u *User) error {
	l, err := ldap.Dial("tcp", fmt.Sprintf("%s:%s", os.Getenv("LDAP_HOST"), os.Getenv("LDAP_PORT")))
	if err != nil {
		return &LDAPConnectionError{}
	}
	defer l.Close()

	err = l.Bind(fmt.Sprintf(os.Getenv("LDAP_BIND_DN"), u.ID), u.Password)
	if err != nil {
		return &LDAPModifyPasswordError{}
	}

	passwordModifyRequest := ldap.NewPasswordModifyRequest("", u.Password, u.NewPassword)
	_, err = l.PasswordModify(passwordModifyRequest)
	if err != nil {
		return &LDAPModifyPasswordError{}
	}
	return nil
}

func main() {
	e := echo.New()
	e.Use(middleware.CSRFWithConfig(middleware.CSRFConfig{
		TokenLookup: "header:X-XSRF-TOKEN",
	}))
	e.Static("/", "assets")
	e.POST("/api/change", change)
	e.Logger.Fatal(e.Start(":5050"))
}
