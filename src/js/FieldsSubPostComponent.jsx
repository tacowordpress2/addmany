import React from 'react';
import InputComponent from './InputComponent.jsx';
import TacoStr from './util/TacoStr.js';
import TacoGeneral from './util/TacoGeneral.js';
import { Provider } from 'react-redux'


/**
 * This is a Fields SubPost React component's class.
 * It is a group of input components/fields within a SubPost.
 */
export default class FieldsSubPostComponent extends React.Component {

 /**
  * The constructor method for this component
  * @param object props
  */
  constructor(props) {
    super(props);

    this.state = {
      fields: null
    };
  }


  /**
   * Perform some actions after the component mounts
   * @return void
   */
  componentDidMount() {
    this.checkAndAddWYSIWYG();
    this.checkAndAddFileUploads();
    this.initLinkFields();
  }


  /**
   * Get rendered fields within a subpost
   * @return React component or null
   */
  getRendered() {
    let self = this;
    let group = [];
    this.fieldsWithWysiwyg = [];
    this.selectorsWithFile = [];
    const { store } = this.context;
    const state  = store.getState();

    if(this.props.fields == null) {
      return;
    }

    for(o in this.props.fields) {
      let fieldName = 'subposts[' + state.fieldName + '][' + this.props.subpostId + '][' + o + ']';
      let props = Object.assign({}, this.props.fields[o]);
      let fieldAttribs = props.attribs;

      if(typeof fieldAttribs.class != 'undefined' && fieldAttribs.class == 'wysiwyg') {
        this.fieldsWithWysiwyg.push({fieldName: fieldName, attribs: fieldAttribs});
      }
      if(fieldAttribs.type === 'image' || fieldAttribs.type === 'file') {
        this.selectorsWithFile.push(fieldName);
      }
      if(typeof fieldAttribs.id === 'undefined' || fieldAttribs.type === 'image' || fieldAttribs.type === 'file') {
        fieldAttribs.id = fieldName.replace(/[^a-z\-0-9\_]+/ig, '-').toLowerCase();
      }
      if(typeof fieldAttribs.class !== 'undefined') {
        fieldAttribs.className = fieldAttribs.class;
        delete fieldAttribs.class;
      }

      group.push(
        <tr key={o}>
          <td>{TacoStr.human(o)}</td>
          <td>
            <InputComponent
              name={fieldName}
              dbValue={props.value}
              attribs={fieldAttribs}
            />
          </td>
        </tr>
      );
    }
    return group;
  }

  /**
   * Check for a link function, and if it exists, call it
   * @return void
   */
  initLinkFields() {
    if(typeof TacoWordPress == 'undefined') {
      return;
    }
    if(typeof TacoWordPress.FieldLinks == 'undefined') {
      return;
    }
     if(typeof TacoWordPress.FieldLinks.checkForLinks == 'undefined') {
      return;
    }
    TacoWordPress.FieldLinks.checkForLinks();
  }

  /**
   * The render method for this component
   * @return React component
   */
  render() {
    const props = this.props;
    const { store } = this.context;
    const state  = store.getState();
    let renderedFields = this.getRendered();
    let orderfieldName = 'subposts[' + state.fieldName + '][' + this.props.subpostId + '][order]';
    let styles = { display: 'none' };
    let addBySearchContent = null;
    let showOnCollapsed = null;
    let collapsedField = this.getShowOnCollapsedField(this.props.showOnCollapsed);
    let renderedCollapsedValue = this.getRenderedCollapsed(collapsedField);

    if(this.props.postReferenceInfo != null) {
      let postReferenceInfo = this.props.postReferenceInfo;
      let postReferencefieldName = 'subposts[' + state.fieldName + '][' + this.props.subpostId + '][post_reference_id]';
      let noFieldsClass = '';
      if(!Object.keys(this.props.fields).length) {
        noFieldsClass = 'no-fields';
      }
      addBySearchContent = (
        <tr>
          <td colSpan="2" className={'addbysearch-reference-td ' + noFieldsClass}>

            <a
              className="addmany-edit-link"
              href={'/wp-admin/post.php?post=' + postReferenceInfo.postId+ '&action=edit'}
              target="_blank">

              <span>{postReferenceInfo.postTitle}</span>
              <span className="dashicons dashicons-external"></span>
            </a>

            <InputComponent
              attribs={{type: 'hidden'}}
              name={postReferencefieldName}
              dbValue={postReferenceInfo.postId} />
          </td>
        </tr>
      );
    }
    return (
      <tbody>

        {
          (this.props.isAddBySearch)
          ? addBySearchContent
          : <tr>
              <td
                colSpan="2"
                className="no-addbysearch-td">
              </td>
            </tr>
        }

        {
          (!this.props.isAddBySearch)
          ? <tr>
              <td colSpan="2" className="show-on-minimized">
                { renderedCollapsedValue  }
              </td>
            </tr>
          : null
        }

        <tr style={styles}>

          <td>
            <InputComponent
              attribs={{type: 'hidden'}}
              name={orderfieldName}
              dbValue={this.props.order} />
          </td>

          <td>
            <InputComponent
              attribs={{type: 'hidden'}}
              name="parent_field_name"
              dbValue={state.fieldName} />
          </td>

        </tr>
        {renderedFields}
      </tbody>
    );
  }

  /**
   * get an array of all the fields values cut to a specified length
   * @param length int
   * @return array
   */
  getMixOfFieldValues(length=15) {
    let mixOfValues = [];
    for(let f of Object.keys(this.props.fields)) {
      let fieldValue = this.props.fields[f].value;
      if(fieldValue !== null) {
        mixOfValues.push(<em style={ { fontSize: '11px' } } key={f}>{ fieldValue.slice(0, length) + '... ' }</em>);
      }
    }
    return mixOfValues;
  }


  /**
   * render what should be shown for a collapsed row
   * @param field object
   * @return html
   */
  getRenderedCollapsed(field) {
    let styles = { marginLeft: '20px' };
    if(!field) {
      return (<strong style={styles}>{ this.getMixOfFieldValues() }</strong>);
    }
    if(field.attribs.type == 'image') {
      return (<img style={ { width: '50px',  height: 'auto', marginLeft: '30px' } } src={ field.value } />)
    }
    return (<strong styles={styles}>{ field.value }</strong>)
  }


  /**
   * get the field config for a collapsed row
   * @param field_key string
   * @return object or null
   */
  getShowOnCollapsedField(field_key) {
    const props = this.props;
    const { store } = this.context;
    const state  = store.getState();

    for(let f of Object.keys(this.props.fields)) {
      if(field_key == f) {
        return this.props.fields[f];
      }
    }
    return null;
  }


  /**
   * Check if the subpost has WYSIWYG fields, and if so, add them
   * @return void
   */
  checkAndAddWYSIWYG() {
    // WYSIWYG editors
    let $ = jQuery;
    let self = this;

    this.fieldsWithWysiwyg.forEach(function(s){
      // Mirror the main content settings
      let settings = $.extend({}, tinyMCEPreInit.mceInit.content);
      wp.editor.initialize(s.attribs.id, {tinymce: settings, quicktags: true});
    });
  }


  /**
   * Check if the subpost has file upload fields, and if so, add them
   * @return void
   */
  checkAndAddFileUploads() {
    // Initial loading of thumbnail
    let $ = jQuery;
    let self = this;

    this.selectorsWithFile.forEach(function(s){
      let $obj = $('[name="' + s + '"]');

      if($obj.length) {
        if($obj.val().match(/(jpg|jpeg|png|gif)$/)) {

          // Race condition bug with TacoWordPress Frontend Js
          if(typeof $obj.addImage == 'undefined') {
            $.fn.addImage = function(url) {
              $(this).removeImage();
              $(this).closest('.upload_field')
                .prepend('<img src="' + url + '" class="thumbnail" />');
              return $(this);
            };
          }
          if(typeof $obj.removeImage == 'undefined') {
            $.fn.removeImage = function() {
              $(this).closest('.upload_field')
                .find('.thumbnail').remove();
              return $(this);
            };
          }
          $obj.addImage($obj.val());
        }
      }
    });
  }


  /**
   * Add the preview thumbnail upon adding a value to a field of image
   * @return void
   */
  getPreviewThumb($obj) {
    if($obj.val().search(/jpg|jpeg|png|gif/gi) > -1) {
      $obj.addImage($obj.val());
    }
  }
}

FieldsSubPostComponent.contextTypes = { store: React.PropTypes.object };
FieldsSubPostComponent.defaultProps = {};
