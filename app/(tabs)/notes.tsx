// app/(tabs)/notes.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../_layout';
import {
  getNotes,
  addNote,
  updateNote,
  deleteNote,
  getCategories,
  getTags,
  addTag,
  addTagToNote,
  getTagsForNote,
} from '../../services/dbService';
import { getSetting } from '../../services/settingsService';
import { Note, Category, Tag, AppSettings } from '../../types';

export default function NotesTabScreen() {
  const { colors, theme } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<AppSettings['sortBy']>('date');

  useEffect(() => {
    loadData();
    loadSettings();
  }, []);

  const loadData = async () => {
    try {
      const [loadedNotes, loadedCategories, loadedTags] = await Promise.all([
        getNotes(),
        getCategories(),
        getTags(),
      ]);
      setNotes(loadedNotes);
      setCategories(loadedCategories);
      setTags(loadedTags);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadSettings = async () => {
    const savedSortBy = await getSetting('sortBy');
    setSortBy(savedSortBy);
  };

  const handleSaveNote = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      let noteId: number;
      
      if (editingNote) {
        await updateNote(editingNote.id!, {
          title,
          content,
          category_id: selectedCategory,
        });
        noteId = editingNote.id!;
      } else {
        noteId = await addNote({
          title,
          content,
          category_id: selectedCategory,
        });
      }

      // Handle tags
      for (const tagName of selectedTags) {
        const existingTag = tags.find(t => t.name === tagName);
        let tagId: number;
        
        if (existingTag) {
          tagId = existingTag.id!;
        } else {
          tagId = await addTag(tagName);
        }
        
        await addTagToNote(noteId, tagId);
      }
      
      setModalVisible(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const handleDeleteNote = (noteId: number) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(noteId);
              loadData();
            } catch (error) {
              console.error('Error deleting note:', error);
            }
          },
        },
      ]
    );
  };

  const handleEditNote = async (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSelectedCategory(note.category_id);
    
    // Load tags for this note
    try {
      const noteTags = await getTagsForNote(note.id!);
      setSelectedTags(noteTags.map(t => t.name));
    } catch (error) {
      console.error('Error loading note tags:', error);
    }
    
    setModalVisible(true);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedCategory(undefined);
    setSelectedTags([]);
    setNewTag('');
    setEditingNote(null);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const sortNotes = (notesToSort: Note[]) => {
    const sorted = [...notesToSort];
    switch (sortBy) {
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'category':
        return sorted.sort((a, b) => {
          const catA = getCategoryName(a.category_id);
          const catB = getCategoryName(b.category_id);
          return catA.localeCompare(catB);
        });
      case 'date':
      default:
        return sorted.sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || '').getTime();
          const dateB = new Date(b.updated_at || b.created_at || '').getTime();
          return dateB - dateA;
        });
    }
  };

  const filteredNotes = sortNotes(
    notes.filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !filterCategory || note.category_id === filterCategory;
      return matchesSearch && matchesCategory;
    })
  );

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const getCategoryColor = (categoryId?: number) => {
    if (!categoryId) return '#666';
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#666';
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[styles.noteItem, { backgroundColor: colors.secondary }]}
      onPress={() => handleEditNote(item)}
      onLongPress={() => handleDeleteNote(item.id!)}
    >
      <View style={styles.noteHeader}>
        <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(item.category_id) },
          ]}
        >
          <Text style={styles.categoryBadgeText}>
            {getCategoryName(item.category_id)}
          </Text>
        </View>
      </View>
      <Text
        style={[styles.noteContent, { color: colors.text }]}
        numberOfLines={2}
      >
        {item.content}
      </Text>
      <View style={styles.noteFooter}>
        <Text style={[styles.noteDate, { color: colors.text + '80' }]}>
          {new Date(item.updated_at || item.created_at || '').toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search notes..."
          placeholderTextColor={colors.text + '80'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            !filterCategory && styles.filterChipActive,
            { borderColor: colors.border },
          ]}
          onPress={() => setFilterCategory(undefined)}
        >
          <Text style={[styles.filterChipText, { color: colors.text }]}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterChip,
              filterCategory === category.id && styles.filterChipActive,
              { borderColor: category.color },
            ]}
            onPress={() => setFilterCategory(category.id)}
          >
            <Text style={[styles.filterChipText, { color: colors.text }]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredNotes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id!.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No notes yet. Tap + to create one.
          </Text>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={30} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingNote ? 'Edit Note' : 'New Note'}
            </Text>
            <TouchableOpacity onPress={handleSaveNote}>
              <Ionicons name="checkmark" size={30} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Title"
              placeholderTextColor={colors.text + '80'}
              value={title}
              onChangeText={setTitle}
            />

            <View style={styles.categorySelector}>
              <Text style={[styles.label, { color: colors.text }]}>Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    !selectedCategory && styles.categoryOptionSelected,
                    { borderColor: colors.border },
                  ]}
                  onPress={() => setSelectedCategory(undefined)}
                >
                  <Text style={{ color: colors.text }}>None</Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      selectedCategory === category.id && styles.categoryOptionSelected,
                      { borderColor: category.color },
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={{ color: colors.text }}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.tagSection}>
              <Text style={[styles.label, { color: colors.text }]}>Tags:</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={[styles.tagInput, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Add tag..."
                  placeholderTextColor={colors.text + '80'}
                  value={newTag}
                  onChangeText={setNewTag}
                  onSubmitEditing={handleAddTag}
                />
                <TouchableOpacity onPress={handleAddTag} style={styles.addTagButton}>
                  <Ionicons name="add-circle" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.selectedTags}>
                {selectedTags.map((tag) => (
                  <View key={tag} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                      <Ionicons name="close-circle" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            <TextInput
              style={[
                styles.input,
                styles.contentInput,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Content"
              placeholderTextColor={colors.text + '80'}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 50,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  filterChipText: {
    fontSize: 14,
  },
  listContainer: {
    padding: 15,
  },
  noteItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noteContent: {
    fontSize: 14,
    marginBottom: 5,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  contentInput: {
    minHeight: 200,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  categorySelector: {
    marginBottom: 15,
  },
  categoryOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryOptionSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  tagSection: {
    marginBottom: 15,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginRight: 10,
  },
  addTagButton: {
    padding: 5,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    marginRight: 5,
    fontSize: 14,
  },
});