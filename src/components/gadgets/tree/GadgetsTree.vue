<template>
  <div class="gadgets-tree">
    <slot name="header"></slot>
    <transition name="slide-fade">
      <div class="ods-mt-3" v-if="(tab === 'custom' && datasource !== '' && datasource.identification !== '#NEW') || tab !== 'custom'">
        <ods-input class="ods-my-2" v-model="filterValue" prefix-icon="ods-icon-search" :placeholder="$t('search')" clearable="clearable"></ods-input>
        <ods-tree class="ods-my-2" ref="tree" :data="tree" :props="{ children: 'children', label: 'name', disabled: 'disabled' }" draggable="draggable" :indent="8" node-key="id" :filter-node-method="filterGadgets" :default-expanded-keys="expandedKeys" :allow-drop="(draggingNode, dropNode) => false" @node-drag-start="(node, $event) => $emit('drag:gadget', getDraggedGadget(node.data.id, tab === 'custom' ? node.data.name : node.data.text), $event)">
          <template v-slot:default="{ node, data }"><span>
              <ods-icon :name="node.level === 1 ? (node.expanded ? 'sort_1' : 'sort-right') : node.isLeaf ? 'drag' : 'sort-right'" size="14"></ods-icon>
              <ods-icon class="ods-mx-2" v-if="node.level === 1" :name="data.icon" size="14"></ods-icon>
              <ods-tooltip v-if="tab !== 'custom'" effect="light" :content="!node.data.favourite ? $t('tooltips.addFavourite') : $t('tooltips.removeFavourites')" placement="top">
                <ods-icon class="ods-mr-2" v-if="node.isLeaf && node.level &gt; 1" size="16" :name="!node.data.favourite ? 'star_off' : 'star_on'" :color="!node.data.favourite ? '' : 'var(--color-data-semantic-warning)'" @click.native="$emit(`open:${node.data.favourite ? 'remove' : 'add'}-fav-modal`, node.data.favourite ? node.data : gadgets.find((g) => g.identification === node.data.text))"></ods-icon>
              </ods-tooltip><span>{{ data.text }}</span></span></template>
        </ods-tree>
      </div>
    </transition>
  </div>
  </template>

<script>
import i18n from './lang'
export default {
  name: 'GadgetsTree',

  i18n,

  props: {
    gadgets: {
      type: Array,
      default: () => []
    },
    tab: {
      type: String,
      default: ''
    },
    datasource: {
      type: [Object, String],
      default: ''
    },
    tree: {
      type: Array,
      default: () => [],
      required: true
    },
    isNew: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      filterValue: '',
      // gadgets tree is loaded from central configuration, but if not defined, load backUp --> PROP: tree
      backUpTree: [
        {
          id: '1',
          name: 'bar',
          types: ['bar', 'BarChart', 'mixed', 'timeseries', 'timeChart'],
          icon: 'chart-bar',
          children: []
        },
        {
          id: '2',
          name: 'line',
          types: ['line', 'LineChart', 'area', 'mixed', 'timeseries'],
          icon: 'chart-line',
          children: []
        },
        {
          id: '3',
          name: 'circular',
          types: ['pie', 'doughnut', 'rosetype'],
          icon: 'pie-chart',
          children: []
        },
        {
          id: '4',
          name: 'radar',
          types: ['radar'],
          icon: 'chart-bar',
          children: []
        },
        {
          id: '5',
          name: 'kpi',
          types: ['kpi', 'kpis', 'progress', 'carousel'],
          icon: 'app',
          children: []
        },
        {
          id: '6',
          name: 'map',
          types: ['map', 'map-openLayers'],
          icon: 'map',
          children: []
        },
        {
          id: '7',
          name: 'table',
          types: ['table', 'gadget-crud', 'gadget-import'],
          icon: 'table',
          children: []
        },
        {
          id: '8',
          name: 'layout',
          types: ['header', 'footer', 'info'],
          icon: 'table',
          children: []
        }
      ]
    }
  },
  computed: {
    gadgetsTree () {
      return this.backUpTree
        .map((b) => {
          const gadgets = [...this.gadgets]
          const condition = (g) => {
            const template = g.gadgetTemplate || g.template || g
            return (
              template.identification &&
              b.types.some((t) =>
                template.identification.toUpperCase().includes(t.toUpperCase())
              )
            )
          }
          b.children = gadgets
            .filter((g) => condition(g))
            .map((g, i) => {
              const template = g.gadgetTemplate || g.template || g
              const id = template.identification
              const name = g.name || id
              return {
                id: `${id}-${i}`,
                favourite: g.favourite,
                favGadget: g.favGadget,
                name: g.name ? g.name : id,
                // text: g.gadgetTemplate || g.template ? g.identification : this.$t(`${name}`)
                text: this.$t(`${name}`) || id
              }
            })
            .sort((a, b) => (a.name > b.name ? -1 : b.name > a.name ? 1 : 0))
          b.text = this.$t(`g-${b.name}`)
          return b
        })
        .filter((b) => b.children.length > 0)
    },
    addBuiltInGadgets () {
      return (rootType, type) => {
        const sourceGadget = this.gadgets.find(
          (g) => g.identification.includes(rootType) && g.js.includes(type)
        )
        const length =
          sourceGadget && sourceGadget.identification.split('-').length
        const newGadget = {
          ...sourceGadget,
          name: `${type}-${
            sourceGadget && sourceGadget.identification.split('-')[length - 1]
          }`
        }
        return newGadget
      }
    },
    getDraggedGadget () {
      return (id, name) => {
        const gadget =
          this.tab === 'custom'
            ? this.gadgets.find((g) =>
              id.includes(
                g.gadgetTemplate
                  ? g.gadgetTemplate.identification
                  : g.template
                    ? g.template.identification
                    : g.identification
              )
            )
            : this.gadgets.find((g) => g.identification === name)
        return gadget.config
          ? { ...gadget, ...JSON.parse(gadget.config) }
          : { ...gadget, category: name }
      }
    },
    expandedKeys () {
      return this.gadgetsTree.filter((g) => g.children.length).map((g) => g.id)
    }
  },

  watch: {
    filterValue: {
      handler (val) {
        this.$refs.tree.filter(val)
      }
    }
  },

  methods: {
    filterGadgets (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    }
  },
  mounted () {
    console.log('GADGETTREE: datasource: ', this.datasource, this.tab)
  }
}
</script>

<style lang="scss" scoped>
.gadgets-tree {
  width: 100%;
}

.slide-fade-enter-active {
  animation: slide-fade 0.8s ease-out;
}
.slide-fade-leave-active {
  animation: slide-fade 0.8s ease-out reverse;
}
@keyframes slide-fade {
  0% {
    max-height: 0;
    opacity: 0.4;
  }
  100% {
    max-height: rem(400);
    opacity: 1;
  }
}
</style>
