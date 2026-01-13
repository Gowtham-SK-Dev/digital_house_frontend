/**
 * Create Post Screen - Text, Image, Article, Video
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@services/api.service';

interface Props {
  navigation: any;
}

export default function CreatePostScreen({ navigation }: Props) {
  const [contentType, setContentType] = useState<'text' | 'image' | 'article' | 'video'>('text');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'circle'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);

  const categories = [
    { id: 'business', label: '💼 Business' },
    { id: 'job', label: '🎯 Jobs' },
    { id: 'marriage', label: '💍 Marriage' },
    { id: 'education', label: '📚 Education' },
    { id: 'health', label: '❤️ Health' },
    { id: 'event', label: '🎉 Events' },
    { id: 'story', label: '📖 Stories' },
    { id: 'article', label: '📰 Articles' },
    { id: 'support', label: '🤝 Support' },
    { id: 'community', label: '👥 Community' },
    { id: 'other', label: '✨ Other' },
  ];

  const contentTypes = [
    { id: 'text', label: 'Text', icon: 'document-text' },
    { id: 'image', label: 'Image', icon: 'image' },
    { id: 'article', label: 'Article', icon: 'document' },
    { id: 'video', label: 'Video', icon: 'play-circle' },
  ];

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      setIsSubmitting(true);

      const postRequest = {
        title: title || undefined,
        description: description || undefined,
        category,
        locationCircleId: location || undefined,
        visibility,
        content: {
          type: contentType,
          text: contentType === 'text' ? content : undefined,
          images: contentType === 'image' ? images : undefined,
          articleUrl: contentType === 'article' ? content : undefined,
        },
      };

      await apiService.post('/posts', postRequest);

      Alert.alert('Success', 'Post created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategoryPicker = ({ item }: { item: (typeof categories)[0] }) => (
    <TouchableOpacity
      style={[styles.categoryItem, category === item.id && styles.categoryItemSelected]}
      onPress={() => {
        setCategory(item.id);
        setShowCategoryPicker(false);
      }}
    >
      <Text style={styles.categoryItemText}>{item.label}</Text>
      {category === item.id && <Ionicons name="checkmark" size={20} color="#007AFF" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity onPress={handleCreatePost} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <Text style={styles.postBtn}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Content Type Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Type</Text>
        <View style={styles.contentTypeGrid}>
          {contentTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.contentTypeBtn,
                contentType === type.id && styles.contentTypeBtnActive,
              ]}
              onPress={() => setContentType(type.id as any)}
            >
              <Ionicons
                name={type.icon}
                size={24}
                color={contentType === type.id ? 'white' : '#666'}
              />
              <Text
                style={[
                  styles.contentTypeText,
                  contentType === type.id && styles.contentTypeTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Title */}
      <View style={styles.section}>
        <Text style={styles.label}>Title (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Give your post a title"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Content */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {contentType === 'text'
            ? 'Content'
            : contentType === 'image'
            ? 'Description'
            : contentType === 'article'
            ? 'Article URL'
            : 'Video URL'}
        </Text>
        <TextInput
          style={[styles.contentInput, { height: contentType === 'text' ? 120 : 60 }]}
          placeholder={
            contentType === 'text'
              ? 'Share your thoughts...'
              : contentType === 'image'
              ? 'Describe your images...'
              : contentType === 'article'
              ? 'Paste article URL'
              : 'Paste video URL'
          }
          placeholderTextColor="#999"
          value={content}
          onChangeText={setContent}
          multiline={contentType === 'text'}
          numberOfLines={contentType === 'text' ? 6 : 2}
        />
      </View>

      {/* Description */}
      {contentType !== 'text' && (
        <View style={styles.section}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.contentInput, { height: 80 }]}
            placeholder="Add a description..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>
      )}

      {/* Images Upload (for image type) */}
      {contentType === 'image' && (
        <View style={styles.section}>
          <View style={styles.imagesHeader}>
            <Text style={styles.label}>Images</Text>
            <TouchableOpacity style={styles.addImageBtn}>
              <Ionicons name="cloud-upload" size={20} color="#007AFF" />
              <Text style={styles.addImageText}>Upload</Text>
            </TouchableOpacity>
          </View>
          {images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imagesScroll}
            >
              {images.map((img, idx) => (
                <View key={idx} style={styles.imageContainer}>
                  <Image source={{ uri: img }} style={styles.uploadedImage} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setImages(images.filter((_, i) => i !== idx))}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Category Selector */}
      <View style={styles.section}>
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity
          style={styles.categoryDropdown}
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
        >
          <Text style={category ? styles.categoryDropdownText : styles.categoryDropdownPlaceholder}>
            {category
              ? categories.find((c) => c.id === category)?.label || 'Select category'
              : 'Select category'}
          </Text>
          <Ionicons
            name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>

        {showCategoryPicker && (
          <View style={styles.categoryPickerContainer}>
            <FlatList
              data={categories}
              renderItem={renderCategoryPicker}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>

      {/* Visibility */}
      <View style={styles.section}>
        <Text style={styles.label}>Who can see this?</Text>
        <View style={styles.visibilityOptions}>
          {(['public', 'friends', 'circle'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.visibilityOption,
                visibility === option && styles.visibilityOptionActive,
              ]}
              onPress={() => setVisibility(option)}
            >
              <Ionicons
                name={
                  option === 'public'
                    ? 'globe'
                    : option === 'friends'
                    ? 'people'
                    : 'location'
                }
                size={16}
                color={visibility === option ? 'white' : '#666'}
              />
              <Text
                style={[
                  styles.visibilityText,
                  visibility === option && styles.visibilityTextActive,
                ]}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.submitSection}>
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleCreatePost}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={20} color="white" />
              <Text style={styles.submitBtnText}>Create Post</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.spacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  postBtn: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  contentTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contentTypeBtn: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    gap: 6,
  },
  contentTypeBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  contentTypeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  contentTypeTextActive: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
  },
  imagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    gap: 4,
  },
  addImageText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  imagesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 8,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#f44336',
    borderRadius: 12,
    padding: 4,
  },
  categoryDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryDropdownText: {
    fontSize: 14,
    color: '#333',
  },
  categoryDropdownPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  categoryPickerContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryItemSelected: {
    backgroundColor: '#f0f7ff',
  },
  categoryItemText: {
    fontSize: 14,
    color: '#333',
  },
  visibilityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  visibilityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    gap: 6,
  },
  visibilityOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  visibilityText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  visibilityTextActive: {
    color: 'white',
  },
  submitSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  submitBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  spacing: {
    height: 20,
  },
});
