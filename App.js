import {
  ImageBackground,
  SectionList,
  StyleSheet,
  PixelRatio,
  Text,
  View,
  FlatList
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import FocusableHighlight from './FocusableHighlight';

let pixelRatio = PixelRatio.get();
const px = (size) => {
  return Math.round(size * pixelRatio);
};

const ROW_HEIGHT = px(160);
const ROW_ITEM_HEIGHT = px(130);
const useSectionList = false;

const ScrollViewDemo = () => {
  const sectionListRef = useRef(null);
  const rowRefs = useRef({});
  const currentPosition = useRef({section: 0, row: 0});

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({});
  useEffect(() => {
    fetch('https://dummyjson.com/products/categories')
    .then(response => response.json())
    .then(json => {
      setCategories(json);
    })
    .catch(error => {
      console.error(error);
    });
  }, []);

  useEffect(() => {
    categories?.length > 0 && categories?.forEach(category => {
      fetch('https://dummyjson.com/products/category/' + category)
      .then(response => response.json())
      .then(json => {
        return setProducts(prev => ({...prev, [category]: json.products}));
      })
      .catch(error => {
        console.error(error);
      });
    });
  }, [categories]);

  const onListViewItemFocus = useCallback((e, section, row, item) => {
    if (!rowRefs.current) {
      return;
    }

    if(currentPosition.current.section !== section) {
      if(useSectionList) {
        sectionListRef.current.scrollToLocation({sectionIndex: section, itemIndex: 0, viewPosition: 0.5, viewOffset: 0, animated: true});
      }
      else {
        sectionListRef.current.scrollToIndex({index: section, viewPosition: 0.5, viewOffset: 0, animated: true})
      }
    }
    if(currentPosition.current.row !== row && section < Object.keys(rowRefs.current).length) {
      const rowRef = rowRefs.current[section];
      if(rowRef) {
        rowRef.scrollToIndex({index: row, viewPosition: 0, viewOffset: 20, animated: true})
      }
    }

    currentPosition.current.section = section;
    currentPosition.current.row = row;
  }, []);

  const showItem = useCallback((item, index, section) => {
    const key = 'sectionlist_item_' + section + '.' + index;
    return (
      <FocusableHighlight
        onPress={() => {}}
        onFocus={e => {
          onListViewItemFocus(e, section, index, item);
        }}
        underlayColor={'#fff'}
        style={styles.rowItem}
        styleFocused={styles.focusStyle}
        nativeID={key}
        key={key}>
        {item?.thumbnail ? (
          <View>
            <ImageBackground
              source={{uri: item?.thumbnail}}
              style={styles.image}>
            </ImageBackground>
            <Text style={styles.text}>{item?.brand}</Text>
          </View>
        ) : null}
      </FocusableHighlight>
    );
  }, []);

  const showRow = useCallback(({section}) => {
    const key = 'sectionlist_row_' + section.title;
    return (
      <>
      <Text style={styles.sectionHeader}>{section.title}</Text>
      <FlatList
        ref={ref => {
          rowRefs.current[section.index] = ref;
        }}
        scrollEnabled={false}
        style={styles.row}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        data={section.data}
        renderItem={({item, index}) => showItem(item, index, section.index)}
        keyExtractor={(_item, index) => key + index}
        getItemLayout={(_data, index) => (
          {length: ROW_ITEM_HEIGHT, offset: ROW_ITEM_HEIGHT * index, index}
        )}
      />
      </>
    );
  }, []);

  const sections = useMemo(() => {
    console.log('Updating sections...');
    return Object.entries(products).map(([key, value], index) => {
      return {
        index: index,
        title: key,
        data: value,
      }
    });
  }, [products]);

  // Render
  return (
    <View style={styles.content}>
      {sections?.length > 0 ? useSectionList ? (
      <SectionList
        ref={sectionListRef}
        style={styles.rows}
        nativeID={'sectionlist'}
        sections={sections}
        renderItem={() => null}
        renderSectionHeader={showRow}
        keyExtractor={(item, index) => `${item}-${index}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        focusable={false}
      />
      ) :
      (
      <FlatList
        ref={sectionListRef}
        style={styles.rows}
        scrollEnabled={false}
        horizontal={false}
        data={sections}
        onScrollToIndexFailed={({index}) => (
            sectionListRef.current?.scrollToIndex({index: index, viewPosition: 0.5, viewOffset: 0, animated: true})
        )}
        renderItem={({_item, index}) => showRow({section: sections[index]})}
      />
      ) : <Text style={{alignSelf: 'center', backgroundColor: 'blue'}}>Loading...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
    height: '100%',
  },
  rows: {
    width: '100%',
    height: '100%',
  },
  row: {
    width: '100%',
    height: ROW_HEIGHT,
  },
  rowItem: {
    width: px(200),
    height: ROW_ITEM_HEIGHT,
    margin: px(10),
    backgroundColor: '#282c34',
    flex: 1,
    alignItems: 'flex-start',
  },
  sectionHeader: {
    marginTop: px(5),
    marginLeft: px(10),
    color: 'white',
    fontSize: px(20),
  },
  text: {
    width: '100%',
    fontSize: px(10),
    color: 'green'
  },
  image: {
    flex: 1,
    width: '100%',
    resizeMode: 'cover',
  },
  focusStyle: {
    borderColor: 'orange',
    borderWidth: 4,
  },
});

export default ScrollViewDemo;