<template lang="pug">
#home.fill-height
  v-toolbar(app)
    v-toolbar-title Dynanote
    v-spacer
    v-tooltip(bottom)
      v-btn(@click="refreshNotes" slot="activator" icon)
        v-icon refresh
      span Refresh
    v-tooltip(bottom)
      v-btn(@click="signOutCb" slot="activator" icon)
        v-icon input
      span Logout
  v-content
    v-card
      v-card-title
        v-tooltip(bottom)
          v-btn(
            @click="createNote"
            slot="activator"
            color="primary"
            dark small fab
          )
            v-icon add
          span New note
        v-spacer
        v-text-field(
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
        )
      v-data-table(
        :headers="headers"
        :items="notes"
        :search="search"
        :rows-per-page-items="[10, 20, 30, { text: 'All', value: -1}]"
        item-key="id"
        rows-per-page-text="Notes per page"
      )
        template(slot="items" slot-scope="props")
          td(@click="viewNote(props.item.id)" style="cursor: pointer")
            | {{ props.item.title }}
            v-chip(v-if="props.item.isNew" color="green" small outline disabled) New
            v-chip(v-if="!props.item.isSaved" color="red" small outline disabled) Unsaved
          td
            v-chip(v-for="tag in props.item.tags" :key="tag" small disabled) {{ tag }}
          td.text-xs-right
            v-icon.mr-2(@click="editNote(props.item.id)" small) edit
            v-icon(@click="deleteNote(props.item)" small) delete
        v-alert(
          slot="no-results"
          :value="true"
          color="error"
          icon="warning"
        ) Your search for "{{ search }}" found no results.
  YesNoDialog(
    title="Delete note"
    ref="deleteNoteDialog"
  )
    | Answering yes will #[strong delete] your note.
    | After this it can only be restored from Google Drive's trash folder.
    br
    br
    strong Are you sure you want to proceed?
</template>

<script>
import { mapState } from 'vuex';
import YesNoDialog from '../components/YesNoDialog.vue';

export default {
  components: {
    YesNoDialog
  },
  data() {
    return {
      search: '',
      headers: [
        { text: 'Title', value: 'title' },
        { text: 'Tags', value: 'tags', sortable: false },
        {
          text: 'Actions', value: 'id', align: 'right', sortable: false
        }
      ]
    };
  },
  computed: {
    ...mapState([
      'notes',
      'signOutCb'
    ])
  },
  async created() {
    this.$store.commit('setLightTheme');
    await this.$store.dispatch('fetchNotes');
  },
  methods: {
    async refreshNotes() {
      await this.$store.dispatch('fetchNotes', { force: true });
    },
    async createNote() {
      const id = await this.$store.dispatch('createNote');
      this.editNote(id);
    },
    async deleteNote(note) {
      const answer = await this.$refs.deleteNoteDialog.open();
      if (answer) {
        await this.$store.dispatch('deleteNote', { note });
      }
    },
    viewNote(id) {
      this.$router.push({ name: 'view', params: { id } });
    },
    editNote(id) {
      this.$router.push({ name: 'edit', params: { id } });
    }
  }
};
</script>
