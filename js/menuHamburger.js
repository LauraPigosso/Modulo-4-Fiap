const menuHamburger = document.getElementById("menu-hamburger")
const menuMobileAberto = document.getElementById("menu-mobile-aberto")
const fecharMenuMobile = document.getElementById("menu-mobile__fechar")

menuHamburger.addEventListener("click", () => {
    menuMobileAberto.classList.add("ativo")
})

fecharMenuMobile.addEventListener("click", () => {
    menuMobileAberto.classList.remove("ativo")
})

