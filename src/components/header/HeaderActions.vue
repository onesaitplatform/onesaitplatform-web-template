<template lang="pug">
ul.ods-actions-menu__ul.ods-actions-menu--header__ul
    router-link(
      to="/"
      custom
      v-slot="{ href, navigate }")
      li(
        @click="navigate"
        @keypress.enter="navigate"
        role="link"
      )
        a(:href="href")
          ods-icon(name="list")
          | Subsection
    li.ods-actions-menu__separator
    router-link(
      to="/"
      custom
      v-slot="{ href, navigate }")
      li(
        @click="navigate"
        @keypress.enter="navigate"
        role="link"
      )
        a(:href="href")
          ods-icon(name="info")
          | Subsection
    router-link(
      to="/"
      custom
      v-slot="{ href, navigate }")
      li(
        @click="navigate"
        @keypress.enter="navigate"
        role="link"
      )
        a(:href="href")
          ods-icon(name="clock")
          | Subsection
    li.ods-actions-menu__separator
    router-link(
      to="/"
      custom
      v-slot="{ href, navigate }")
      li(
        @click="navigate"
        @keypress.enter="navigate"
        role="link"
      )
        a(:href="href")
          ods-icon(name="store")
          | Subsection
    router-link(
      to="/"
      custom
      v-slot="{ href, navigate }")
      li(
        @click="navigate"
        @keypress.enter="navigate"
        role="link"
      )
        a(:href="href")
          ods-icon(name="broadcast")
          | Subsection
    router-link(
      to="/"
      custom
      v-slot="{ href, navigate }")
      li(
        @click="navigate"
        @keypress.enter="navigate"
        role="link"
      )
        a(:href="href")
          ods-icon(name="book")
          | Subsection
</template>
