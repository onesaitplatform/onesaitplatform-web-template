<template>
  <div class="home">
    <Hello></Hello>
    <!-- <Graph class="wrapper" ref="network" title="NetworkGraph Ring Topology" :networkGraph="network"></Graph> -->
  </div>
</template>
<script>

import Hello from '@/components/HelloODS.vue'
// import Graph from '@/components/shared/Graph.vue'

export default {
  name: 'Home',
  components: {
    // Graph,
    Hello
  },
  data () {
    return {
      // network data to graph, filled in init.
      // computed network object to graph
      network: {
        nodes: [],
        edges: [],
        options: {}
      },
      // graph default options
      defaultOptions: {
        autoResize: true,
        height: '100%',
        width: '100%',
        locale: 'en',
        physics: {
          stabilization: true,
          barnesHut: {
            springLength: 200,
            avoidOverlap: 0.4
          }
        },
        interaction: {
          dragNodes: true,
          dragView: true,
          hideEdgesOnDrag: false,
          hideEdgesOnZoom: false,
          hideNodesOnDrag: false,
          hover: false,
          hoverConnectedEdges: true,
          keyboard: {
            enabled: false,
            speed: { x: 10, y: 10, zoom: 0.02 },
            bindToWindow: true,
            autoFocus: true
          },
          multiselect: false,
          navigationButtons: false,
          selectable: true,
          selectConnectedEdges: true,
          tooltipDelay: 300,
          zoomSpeed: 1,
          zoomView: true
        },
        nodes: {
          shape: 'dot',
          size: 24,
          color: {
            border: 'grey',
            highlight: {
              border: 'black',
              background: 'white'
            },
            hover: {
              border: 'orange',
              background: 'grey'
            }
          },
          font: { color: 'black' },
          shapeProperties: {
            useBorderWithImage: true
          }
        }
      },
      // data from form topology
      topology: {
        nodes: [
          {
            id: 'urn:onesait:thing:8fd37cfa-f010-4645-bd3e-fd6ef87b4691',
            label: 'ubuntu-QEMU-Virtual-Machine'
          },
          {
            id: 'urn:onesait:thing:146317c5-cd72-4e8e-b878-eeb8c369a244',
            label: 'derconnect-edge-8'
          },
          {
            id: 'urn:onesait:thing:15dbc9bb-4f3b-488d-897a-d2926407aade',
            label: 'Derconnect-Edge-1'
          },
          {
            id: 'urn:onesait:thing:27070daf-3287-497a-a545-b8a5ff500c2b',
            label: 'Derconnect-Edge-5'
          },
          {
            id: 'urn:onesait:thing:33adfcf8-5930-4fd7-a4af-853b6a87d20b',
            label: 'derconnect-edge-7'
          }
        ],
        links: [
          {
            source: 'urn:onesait:thing:8fd37cfa-f010-4645-bd3e-fd6ef87b4691',
            target: 'urn:onesait:thing:8fd37cfa-f010-4645-bd3e-fd6ef87b4691'
          },
          {
            source: 'urn:onesait:thing:146317c5-cd72-4e8e-b878-eeb8c369a244',
            target: 'urn:onesait:thing:15dbc9bb-4f3b-488d-897a-d2926407aade'
          },
          {
            source: 'urn:onesait:thing:15dbc9bb-4f3b-488d-897a-d2926407aade',
            target: 'urn:onesait:thing:27070daf-3287-497a-a545-b8a5ff500c2b'
          },
          {
            source: 'urn:onesait:thing:27070daf-3287-497a-a545-b8a5ff500c2b',
            target: 'urn:onesait:thing:33adfcf8-5930-4fd7-a4af-853b6a87d20b'
          },
          {
            source: 'urn:onesait:thing:33adfcf8-5930-4fd7-a4af-853b6a87d20b',
            target: 'urn:onesait:thing:146317c5-cd72-4e8e-b878-eeb8c369a244'
          },
          {
            source: 'urn:onesait:thing:146317c5-cd72-4e8e-b878-eeb8c369a244',
            target: 'urn:onesait:thing:33adfcf8-5930-4fd7-a4af-853b6a87d20b'
          },
          {
            source: 'urn:onesait:thing:33adfcf8-5930-4fd7-a4af-853b6a87d20b',
            target: 'urn:onesait:thing:27070daf-3287-497a-a545-b8a5ff500c2b'
          },
          {
            source: 'urn:onesait:thing:27070daf-3287-497a-a545-b8a5ff500c2b',
            target: 'urn:onesait:thing:15dbc9bb-4f3b-488d-897a-d2926407aade'
          },
          {
            source: 'urn:onesait:thing:15dbc9bb-4f3b-488d-897a-d2926407aade',
            target: 'urn:onesait:thing:146317c5-cd72-4e8e-b878-eeb8c369a244'
          }
        ]
      }
    }
  },
  methods: {
  },
  created () {
    // this.network = this.mountGraphData()
  }
}
</script>
